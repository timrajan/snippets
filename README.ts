// Log the error
        File.AppendAllText(@"C:\temp\devops_debug.txt",
            $"{DateTime.Now}: ERROR={ex.Message}, INNER={ex.InnerException?.Message}{Environment.NewLine}");
