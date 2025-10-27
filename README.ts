var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestHeadersTotalSize = 65536; // 64 KB (default is 32 KB)
    serverOptions.Limits.MaxRequestHeaderCount = 100; // default is 100
});

// Rest of your configuration...
var app = builder.Build();


dbug: Microsoft.AspNetCore.Server.Kestrel.BadRequests[17]
      Connection id "" bad request data: "Request headers too long."
      Microsoft.AspNetCore.Server.Kestrel.Core.BadHttpRequestException: Request headers too long.
         at Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.Http1Connection.<TakeMessageHeaders>g__TrimAndTakeMessageHeaders|45_0(SequenceReader`1& reader, Boolean trailers)
         at Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.Http1Connection.TakeMessageHeaders(SequenceReader`1& reader, Boolean trailers)
         at Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.Http1Connection.ParseRequest(SequenceReader`1& reader)
         at Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.Http1Connection.TryParseRequest(ReadResult result, Boolean& endConnection)
         at Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.HttpProtocol.ProcessRequests[TContext](IHttpApplication`1 application)
         at Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.HttpProtocol.ProcessRequestsAsync[TContext](IHttpApplication`1 application)

ERROR:  column "abc" cannot be cast automatically to type bigint
HINT:  You might need to specify "USING abc::bigint".


# Navigate to PostgreSQL bin folder or add it to PATH
cd "C:\Program Files\PostgreSQL\14\bin"

# Stop the server
pg_ctl stop -D "C:\Program Files\PostgreSQL\14\data"

# Force stop
pg_ctl stop -D "C:\Program Files\PostgreSQL\14\data" -m immediate



 developed a test data generation and maintenance web application that streamlines QA workflows, reducing the time and effort required for test data preparation."

 empowers our QA team to generate and maintain test data independently, reducing bottlenecks and improving overall testing productivity."

   "reducing test data setup time by X%" or "enabling QA to prepare test environments X times faster."
