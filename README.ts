const azdev = require('azure-devops-node-api');
const GitInterfaces = require('azure-devops-node-api/interfaces/GitInterfaces');
const fs = require('fs');

async function updateExcelFile() {
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
    const branchName = 'refs/heads/your-target-branch';
    const filePath = 'path/to/your/file.xlsx'; // Path to Excel file in the repo
    const localExcelFilePath = './your-updated-file.xlsx'; // Local Excel file to upload
    
    // Read the Excel file and convert to Base64
    const fileBuffer = fs.readFileSync(localExcelFilePath);
    const base64Content = fileBuffer.toString('base64');
    
    // Get the repository ID
    const repositories = await gitClient.getRepositories(projectName);
    const repository = repositories.find(repo => repo.name === repoName);
    
    if (!repository) {
      throw new Error(`Repository '${repoName}' not found`);
    }
    
    // Get the latest commit on the branch
    const refs = await gitClient.getRefs(repository.id, projectName, branchName);
    
    if (!refs || refs.length === 0) {
      throw new Error(`Branch '${branchName}' not found`);
    }
    
    const latestCommitId = refs[0].objectId;
    
    // Check if the file already exists
    let changeType = GitInterfaces.VersionControlChangeType.Edit;
    try {
      await gitClient.getItem(repository.id, filePath, projectName, undefined, undefined, latestCommitId);
    } catch (error) {
      // File does not exist, use Add instead of Edit
      changeType = GitInterfaces.VersionControlChangeType.Add;
    }
    
    // Create the push with a commit that updates the Excel file
    const push = {
      refUpdates: [
        {
          name: branchName,
          oldObjectId: latestCommitId
        }
      ],
      commits: [
        {
          comment: 'Update Excel file',
          changes: [
            {
              changeType: changeType,
              item: {
                path: filePath
              },
              newContent: {
                content: base64Content,
                contentType: GitInterfaces.ItemContentType.Base64Encoded
              }
            }
          ]
        }
      ]
    };
    
    // Push the changes
    const result = await gitClient.createPush(push, repository.id, projectName);
    
    console.log('Excel file updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating Excel file:', error);
    throw error;
  }
}

// Execute the function
updateExcelFile().catch(error => {
  console.error('Script failed:', error);
});
