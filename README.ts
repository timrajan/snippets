// Add this after your HTTP call
File.AppendAllText(@"C:\temp\devops_debug.txt", 
    $"{DateTime.Now}: Status={response.StatusCode}, Body={body}{Environment.NewLine}");

// Add this inside your catch block
File.AppendAllText(@"C:\temp\devops_debug.txt", 
    $"{DateTime.Now}: ERROR={ex.Message}, Stack={ex.StackTrace}{Environment.NewLine}");


mkdir C:\temp
icacls "C:\temp" /grant "IIS AppPool\YourAppPoolName:(OI)(CI)F"

Get-Content C:\temp\devops_debug.txt
