app.Use(async (context, next) =>
{
    Console.WriteLine($"===== REQUEST START =====");
    Console.WriteLine($"Method: {context.Request.Method}");
    Console.WriteLine($"Path: {context.Request.Path}");
    Console.WriteLine($"Content-Type: {context.Request.ContentType}");
    Console.WriteLine($"Has Form: {context.Request.HasFormContentType}");
    
    // Read form data if present
    if (context.Request.HasFormContentType && context.Request.Method == "POST")
    {
        // Enable buffering to read the form multiple times
        context.Request.EnableBuffering();
        
        var form = await context.Request.ReadFormAsync();
        Console.WriteLine($"Form Data:");
        foreach (var key in form.Keys)
        {
            Console.WriteLine($"  {key}: {form[key]}");
        }
        
        // Reset the stream position so the controller can read it
        context.Request.Body.Position = 0;
    }
    
    Console.WriteLine($"========================");
    
    await next();
    
    Console.WriteLine($"===== RESPONSE =====");
    Console.WriteLine($"Status Code: {context.Response.StatusCode}");
    Console.WriteLine($"===================");
});
