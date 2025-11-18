app.Use(async (context, next) =>
{
    Console.WriteLine($"===== REQUEST =====");
    Console.WriteLine($"Method: {context.Request.Method}");
    Console.WriteLine($"Path: {context.Request.Path}");
    Console.WriteLine($"Content-Type: {context.Request.ContentType}");
    Console.WriteLine($"===================");
    
    await next();
});
