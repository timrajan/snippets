// =====================================================================
// BuildPollingService.cs — single-file drop-in
// ---------------------------------------------------------------------
// The ONLY new file you need. Everything is in this one class.
//
// Wiring (2 lines in Program.cs):
//     builder.Services.AddHttpClient("ado");
//     builder.Services.AddHostedService<BuildPollingService>();
//
// appsettings.json (1 small section):
//     "Ado": { "Organization": "your-org", "Project": "your-project" }
//
// web.config (next to your existing HTTPS_PROXY variable):
//     <environmentVariable name="ADO_PAT" value="your-pat" />
//
// Entity: uses your EXISTING entity/table where you already save the
// run ID. Adjust the marked lines (entity type + property names) below.
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

            // ---------------------------------------------------------------
            // ADJUST: entity type + property names to match your existing table.
            // Required columns: RunId (int), Status (string), Result (string?),
            //                   TriggeredAt, CompletedAt?, LastPolledAt?, PollErrorCount (int)
            // ---------------------------------------------------------------
            var unfinished = await db.BuildRuns
                .Where(b => b.Status == "Pending" || b.Status == "InProgress")
                .OrderBy(b => b.TriggeredAt)
                .Take(50)
                .ToListAsync(ct);

            if (unfinished.Count == 0) return;

            var http = CreateAdoClient();

            foreach (var run in unfinished)
            {
                ct.ThrowIfCancellationRequested();
                run.LastPolledAt = DateTime.UtcNow;

                if (DateTime.UtcNow - run.TriggeredAt > TimeSpan.FromHours(_maxPollHours))
                {
                    run.Status = "TimedOut";
                    run.CompletedAt = DateTime.UtcNow;
                    _logger.LogWarning("Run {id} timed out after {h}h", run.RunId, _maxPollHours);
                    continue;
                }

                var (ok, status, result, finishTime) = await GetBuildStatus(http, run.RunId, ct);

                if (!ok)
                {
                    run.PollErrorCount++;
                    if (run.PollErrorCount >= _maxErrors)
                    {
                        run.Status = "PollError";
                        run.CompletedAt = DateTime.UtcNow;
                        _logger.LogError("Run {id} marked PollError after {n} failures", run.RunId, run.PollErrorCount);
                    }
                    continue;
                }

                run.PollErrorCount = 0;

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
                        run.Result = result;                       // succeeded | failed | partiallySucceeded | canceled
                        run.CompletedAt = finishTime ?? DateTime.UtcNow;
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

        private async Task<(bool ok, string status, string? result, DateTime? finishTime)>
            GetBuildStatus(HttpClient http, int runId, CancellationToken ct)
        {
            try
            {
                var url = $"{Uri.EscapeDataString(_project)}/_apis/build/builds/{runId}?api-version=7.1";
                using var resp = await http.GetAsync(url, ct);

                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("ADO returned {code} for run {id}", (int)resp.StatusCode, runId);
                    return (false, "", null, null);
                }

                await using var stream = await resp.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
                var root = doc.RootElement;

                return (
                    true,
                    root.GetProperty("status").GetString() ?? "",
                    root.TryGetProperty("result", out var r) ? r.GetString() : null,
                    root.TryGetProperty("finishTime", out var f) && f.ValueKind == JsonValueKind.String
                        ? f.GetDateTime() : null);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error polling run {id}", runId);
                return (false, "", null, null);
            }
        }
    }
}
