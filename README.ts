 Console.WriteLine($"===== REQUEST START =====");
    Console.WriteLine($"Method: {context.Request.Method}");
    Console.WriteLine($"Scheme: {context.Request.Scheme}"); // http or https
    Console.WriteLine($"Host: {context.Request.Host}"); // localhost:5000
    Console.WriteLine($"Path: {context.Request.Path}"); // /Student/Register
    Console.WriteLine($"PathBase: {context.Request.PathBase}"); // base path if app is in subdirectory
    Console.WriteLine($"QueryString: {context.Request.QueryString}"); // ?id=123
    Console.WriteLine($"Full URL: {context.Request.Scheme}://{context.Request.Host}{context.Request.PathBase}{context.Request.Path}{context.Request.QueryString}");
    Console.WriteLine($"Content-Type: {context.Request.ContentType}");
    Console.WriteLine($"Has Form: {context.Request.HasFormContentType}");
