public class YourExistingController : ControllerBase
{
    private readonly YourExistingDbContext _context; // Your existing context
    private readonly IAzureDevOpsBuildService _buildService; // ADD THIS
    // Your other existing dependencies...

    public YourExistingController(
        YourExistingDbContext context,
        IAzureDevOpsBuildService buildService, // ADD THIS
        // Your other existing dependencies...
    )
    {
        _context = context;
        _buildService = buildService; // ADD THIS
        // Your existing assignments...
    }

    // YOUR EXISTING ENDPOINT - Just modify this
    [HttpPost("your-existing-endpoint")] // Keep your existing route
    public async Task<IActionResult> YourExistingMethod([FromBody] YourExistingRequestModel request)
    {
        try
        {
            // YOUR EXISTING LOGIC FIRST
            // Do whatever you were already doing with the 9 parameters...
            
            // Your existing business logic here...
            // Save to database, validate, etc.

            // ADD THIS NEW SECTION - Azure DevOps Build Trigger
            const int PIPELINE_ID = 123; // Replace with your actual pipeline ID
            
            var buildParameters = new Dictionary<string, string>
            {
                { "environment", request.Environment }, // Your dropdown parameter (parameter 1)
                { "parameter1", request.Parameter1 ?? "" }, // Text field parameter 2
                { "parameter2", request.Parameter2 ?? "" }, // Text field parameter 3
                { "parameter3", request.Parameter3 ?? "" }, // Text field parameter 4
                { "parameter4", request.Parameter4 ?? "" }, // Text field parameter 5
                { "parameter5", request.Parameter5 ?? "" }, // Text field parameter 6
                { "parameter6", request.Parameter6 ?? "" }, // Text field parameter 7
                { "parameter7", request.Parameter7 ?? "" }, // Text field parameter 8
                { "parameter8", request.Parameter8 ?? "" }  // Text field parameter 9
            };

            // Trigger the Azure DevOps build
            var build = await _buildService.TriggerBuildAsync(PIPELINE_ID, buildParameters);

            // OPTIONAL: Update your existing entity with build info
            // If you have an entity you want to update with build details:
            /*
            var yourExistingEntity = await _context.YourEntities.FindAsync(request.Id);
            if (yourExistingEntity != null)
            {
                yourExistingEntity.BuildId = build.Id;
                yourExistingEntity.BuildNumber = build.BuildNumber;
                yourExistingEntity.BuildStatus = "Queued";
                await _context.SaveChangesAsync();
            }
            */

            // YOUR EXISTING RESPONSE - just add build info
            return Ok(new 
            { 
                // Your existing response properties...
                Message = "Process completed and build triggered successfully",
                
                // Add build information to your existing response
                BuildInfo = new
                {
                    BuildId = build.Id,
                    BuildNumber = build.BuildNumber,
                    Status = build.Status.ToString(),
                    QueueTime = build.QueueTime
                }
            });
        }
        catch (Exception ex)
        {
            // Your existing error handling...
            return StatusCode(500, new { Error = "Process failed", Details = ex.Message });
        }
    }
}
