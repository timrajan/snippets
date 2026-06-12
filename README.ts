    foreach (var run in unfinished)
    {
        ct.ThrowIfCancellationRequested();
        var runId = run.BuildRunId!.Value;
        // Safety timeout based on created_at — never poll a row forever
        if (DateTime.UtcNow - run.created_at > TimeSpan.FromHours(_maxPollHours))
        {
            run.status = "TimedOut";
            _errorCounts.Remove(run.BuildRunId);
            _logger.LogWarning("Run {id} timed out after {h}h", run.BuildRunId, _maxPollHours);
            continue;
        }

        var (ok, status, result) = await GetBuildStatus(http, run.BuildRunId, ct);

        if (!ok)
        {
            var errors = _errorCounts.GetValueOrDefault(run.BuildRunId) + 1;
            _errorCounts[run.RunId] = errors;

            if (errors >= _maxErrors)
            {
                run.status = "PollError";
                _errorCounts.Remove(run.BuildRunId);
                _logger.LogError("Run {id} marked PollError after {n} consecutive failures",
                    run.BuildRunId, errors);
            }
            continue;
        }

        _errorCounts.Remove(run.BuildRunId);   // success resets the counter

        switch (status)
        {
            case "notStarted":
            case "postponed":
                run.status = "Pending";
                break;

            case "inProgress":
            case "cancelling":
                run.status = "InProgress";
                break;

            case "completed":
                run.status = "Completed";

                //run.Result = result;     // succeeded | failed | partiallySucceeded | canceled
                _logger.LogInformation("Run {id} completed: {result}", run.BuildRunId, result);
                break;

            default:
                _logger.LogWarning("Run {id}: unknown ADO status '{status}'", run.BuildRunId, status);
                break;
        }
    }

    await db.SaveChangesAsync(ct);
}
