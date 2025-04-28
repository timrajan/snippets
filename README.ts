const azdev = require('azure-devops-node-api');
const GitInterfaces = require('azure-devops-node-api/interfaces/GitInterfaces');

async function createPullRequest() {
  try {
    // Connection details
    const orgUrl = 'https://dev.azure.com/yourOrganization';
    const token = 'YOUR_PERSONAL_ACCESS_TOKEN';
    
    // Create authorization handler
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    const connection = new azdev.WebApi(orgUrl, authHandler);
    
    // Get Git API client
    const gitClient = await connection.getGitApi();
    
    // Parameters
    const projectName = 'YourProjectName';
    const repoName = 'YourRepositoryName';
    const sourceBranchName = 'refs/heads/your-feature-branch'; // The branch with your changes
    const targetBranchName = 'refs/heads/master'; // The branch you want to merge into (e.g., master or main)
    
    // Get the repository ID
    const repositories = await gitClient.getRepositories(projectName);
    const repository = repositories.find(repo => repo.name === repoName);
    
    if (!repository) {
      throw new Error(`Repository '${repoName}' not found`);
    }
    
    console.log(`Found repository: ${repository.name} (${repository.id})`);
    
    // Create the pull request object
    const pullRequestToCreate = {
      sourceRefName: sourceBranchName,
      targetRefName: targetBranchName,
      title: 'Update Excel file',
      description: 'This pull request updates the Excel file with new data.',
      isDraft: false, // Set to true if you want to create a draft PR
      
      // Optional: Add reviewers
      reviewers: [
        // {
        //   id: 'Reviewer-User-ID-GUID' // You would need to get this from elsewhere
        // }
      ]
    };
    
    console.log('Creating pull request...');
    
    // Create the pull request
    const createdPR = await gitClient.createPullRequest(
      pullRequestToCreate,
      repository.id,
      projectName
    );
    
    console.log('Pull request created successfully:');
    console.log(`ID: ${createdPR.pullRequestId}`);
    console.log(`Title: ${createdPR.title}`);
    console.log(`URL: ${createdPR.url}`);
    console.log(`Status: ${createdPR.status}`);
    
    return createdPR;
  } catch (error) {
    console.error('Error creating pull request:', error);
    if (error.message) {
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

// Execute the function
createPullRequest().catch(error => {
  console.error('Script failed');
});
