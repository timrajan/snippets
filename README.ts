Source branch 'refs/heads/master' not found

const azdev = require('azure-devops-node-api');
const GitApi = require('azure-devops-node-api/GitApi');

async function createBranch() {
  try {
    // Create a connection to Azure DevOps
    const orgUrl = 'https://dev.azure.com/yourOrganization';
    const token = 'YOUR_PERSONAL_ACCESS_TOKEN'; // Create this in Azure DevOps
    
    // Create authorization handler
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    const connection = new azdev.WebApi(orgUrl, authHandler);
    
    // Get Git API client
    const gitClient = await connection.getGitApi();
    
    // Parameters for branch creation
    const projectName = 'YourProjectName';
    const repoName = 'YourRepositoryName';
    const sourceBranchName = 'refs/heads/main'; // Source branch (usually main or master)
    const targetBranchName = 'refs/heads/new-feature-branch'; // New branch to create
    
    // Get the repository ID
    const repositories = await gitClient.getRepositories(projectName);
    const repository = repositories.find(repo => repo.name === repoName);
    
    if (!repository) {
      throw new Error(`Repository '${repoName}' not found`);
    }
    
    // Get the source branch reference to obtain its object ID
    const refs = await gitClient.getRefs(repository.id, projectName, sourceBranchName);
    
    if (!refs || refs.length === 0) {
      throw new Error(`Source branch '${sourceBranchName}' not found`);
    }
    
    const sourceObjectId = refs[0].objectId;
    
    // Create the new branch reference
    const newRef = {
      name: targetBranchName,
      oldObjectId: '0000000000000000000000000000000000000000', // Zero ID for new ref
      newObjectId: sourceObjectId
    };
    
    // Create the branch
    const result = await gitClient.updateRefs([newRef], repository.id, projectName);
    
    console.log('Branch created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
}

// Execute the function
createBranch().catch(error => {
  console.error('Script failed:', error);
});
