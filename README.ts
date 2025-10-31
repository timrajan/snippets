 // Enable SQL logging to console
    options.LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information);
    options.EnableSensitiveDataLogging(); // Shows parameter values in logs
    options.EnableDetailedErrors();
