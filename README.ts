let allTestPlans = [];
let continuationToken = undefined;
let page = 1;

// Loop to handle pagination
    do {
      console.log(`Fetching page ${page} of test plans...`);
      
      // Get a page of test plans
      // The API accepts a continuationToken for pagination
      const testPlansPage = await testPlanApi.getTestPlans(
        config.project,         // project
        undefined,              // owner
        continuationToken,      // continuationToken
        true                    // includePlanDetails
      );
      
      if (testPlansPage && testPlansPage.length > 0) {
        allTestPlans = allTestPlans.concat(testPlansPage);
        console.log(`Retrieved ${testPlansPage.length} test plans in page ${page}`);
        
        // Check if there's a continuation token in the response headers
        // This is typically returned in the response headers as 'x-ms-continuationtoken'
        continuationToken = connection.getResponseContinuationToken();
        
        // Increment page counter
        page++;
      } else {
        // No more test plans
        continuationToken = undefined;
      }
    } while (continuationToken);
    
    console.log(`Retrieved a total of ${allTestPlans.length} test plans`);
