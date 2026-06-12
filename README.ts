// =====================================================================
// BuildPollingService.cs — minimal-schema version
// ---------------------------------------------------------------------
// Works with ONLY these columns on your existing table:
//     run_id  (int)      — the ADO run ID you save at trigger time
//     status  (string)   — Pending | InProgress | Completed | TimedOut | PollError
//     result  (string?)  — succeeded | failed | partiallySucceeded | canceled
//     created_at (timestamp) — set when the row is inserted
//
// No last_polled_at, no completed_at, no poll_error_count columns needed.
// Error counting is kept in memory (resets on app restart — by design).
//
// Wiring in Program.cs:
//     builder.Services.AddHttpClient("ado");
//     builder.Services.AddHostedService<BuildPollingService>();
// =====================================================================

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MyApp.Data;      // <-- your DbContext namespace
using MyApp.Models;    // <-- your existing entity namespace

namespace MyApp.Services
{
    public class BuildPollingService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHttpClientFactory _httpFactory;
        private readonly ILogger<BuildPollingService> _logger;

        private readonly string _org;
        private readonly string _project;
        private readonly string _pat;
        private readonly int _intervalSeconds;
        private readonly int _maxPollHours;
        private readonly int _maxErrors;

        // In-memory error counter per run ID. Resets on app restart, which is
        // fine: a restart just gives a struggling run a fresh set of attempts.
        private readonly Dictionary<int, int> _errorCounts = new();

        public BuildPollingService(
            IServiceScopeFactory scopeFactory,
            IHttpClientFactory httpFactory,
            IConfiguration config,
            ILogger<BuildPollingService> logger)
        {
            _scopeFactory = scopeFactory;
            _httpFactory = httpFactory;
            _logger = logger;

            _org = config["Ado:Organization"] ?? throw new InvalidOperationException("Ado:Organization missing");
            _project = config["Ado:Project"] ?? throw new InvalidOperationException("Ado:Project missing");
            _pat = Environment.GetEnvironmentVariable("ADO_PAT")
                   ?? config["Ado:Pat"]
                   ?? throw new InvalidOperationException("ADO_PAT env var missing");
            _intervalSeconds = config.GetValue("Ado:PollIntervalSeconds", 30);
            _maxPollHours = config.GetValue("Ado:MaxPollHours", 2);
            _maxErrors = config.GetValue("Ado:MaxConsecutiveErrors", 10);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Build polling started: every {s}s", _intervalSeconds);

            try { await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); }
            catch (OperationCanceledException) { return; }

            // First cycle immediately — catches up builds that finished while app was down
            await SafeCycle(stoppingToken);

            using var timer = new PeriodicTimer(TimeSpan.FromSeconds(_intervalSeconds));
            try
            {
                while (await timer.WaitForNextTickAsync(stoppingToken))
                    await SafeCycle(stoppingToken);
            }
            catch (OperationCanceledException) { /* graceful shutdown */ }

            _logger.LogInformation("Build polling stopped");
        }

        private async Task SafeCycle(CancellationToken ct)
        {
            try { await PollCycle(ct); }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
            catch (Exception ex) { _logger.LogError(ex, "Poll cycle failed; retrying next interval"); }
        }

        private async Task PollCycle(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();  // <-- your DbContext type

            // ADJUST: db.BuildRuns + property names (RunId, Status, Result, CreatedAt)
            // to match your entity exactly.
            var unfinished = await db.BuildRuns
                .Where(b => b.Status == "Pending" || b.Status == "InProgress")
                .OrderBy(b => b.CreatedAt)
                .Take(50)
                .ToListAsync(ct);

            if (unfinished.Count == 0)
            {
                _errorCounts.Clear();   // nothing in flight; drop any stale counters
                return;
            }

            var http = CreateAdoClient();

            foreach (var run in unfinished)
            {
                ct.ThrowIfCancellationRequested();

                // Safety timeout based on created_at — never poll a row forever
                if (DateTime.UtcNow - run.CreatedAt > TimeSpan.FromHours(_maxPollHours))
                {
                    run.Status = "TimedOut";
                    _errorCounts.Remove(run.RunId);
                    _logger.LogWarning("Run {id} timed out after {h}h", run.RunId, _maxPollHours);
                    continue;
                }

                var (ok, status, result) = await GetBuildStatus(http, run.RunId, ct);

                if (!ok)
                {
                    var errors = _errorCounts.GetValueOrDefault(run.RunId) + 1;
                    _errorCounts[run.RunId] = errors;

                    if (errors >= _maxErrors)
                    {
                        run.Status = "PollError";
                        _errorCounts.Remove(run.RunId);
                        _logger.LogError("Run {id} marked PollError after {n} consecutive failures",
                            run.RunId, errors);
                    }
                    continue;
                }

                _errorCounts.Remove(run.RunId);   // success resets the counter

                switch (status)
                {
                    case "notStarted":
                    case "postponed":
                        run.Status = "Pending";
                        break;

                    case "inProgress":
                    case "cancelling":
                        run.Status = "InProgress";
                        break;

                    case "completed":
                        run.Status = "Completed";
                        run.Result = result;     // succeeded | failed | partiallySucceeded | canceled
                        _logger.LogInformation("Run {id} completed: {result}", run.RunId, result);
                        break;

                    default:
                        _logger.LogWarning("Run {id}: unknown ADO status '{status}'", run.RunId, status);
                        break;
                }
            }

            await db.SaveChangesAsync(ct);
        }

        private HttpClient CreateAdoClient()
        {
            // Factory-managed handler: no socket exhaustion on IIS.
            // HTTPS_PROXY env var (already in your web.config) is honoured automatically.
            var http = _httpFactory.CreateClient("ado");
            http.BaseAddress = new Uri($"https://dev.azure.com/{_org}/");
            http.Timeout = TimeSpan.FromSeconds(20);
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($":{_pat}")));
            return http;
        }

        private async Task<(bool ok, string status, string? result)>
            GetBuildStatus(HttpClient http, int runId, CancellationToken ct)
        {
            try
            {
                var url = $"{Uri.EscapeDataString(_project)}/_apis/build/builds/{runId}?api-version=7.1";
                using var resp = await http.GetAsync(url, ct);

                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("ADO returned {code} for run {id}", (int)resp.StatusCode, runId);
                    return (false, "", null);
                }

                await using var stream = await resp.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
                var root = doc.RootElement;

                return (
                    true,
                    root.GetProperty("status").GetString() ?? "",
                    root.TryGetProperty("result", out var r) ? r.GetString() : null);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error polling run {id}", runId);
                return (false, "", null);
            }
        }
    }
}
