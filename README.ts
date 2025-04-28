const azdev = require('azure-devops-node-api');

async function findUserIds() {
  try {
    // Connection details
    const orgUrl = 'https://dev.azure.com/yourOrganization';
    const token = 'YOUR_PERSONAL_ACCESS_TOKEN';
    
    // Create authorization handler
    const authHandler = azdev.getPersonalAccessTokenHandler(token);
    const connection = new azdev.WebApi(orgUrl, authHandler);
    
    // Get API clients
    const coreApi = await connection.getCoreApi();
    const identityApi = await connection.getIdentityApi();
    
    // Parameters
    const projectName = 'YourProjectName';
    
    console.log('Looking up users in project:', projectName);
    
    // Method 1: Get team members
    try {
      // First get the teams in the project
      const teams = await coreApi.getTeams(projectName);
      console.log(`Found ${teams.length} teams in the project`);
      
      // For each team, get its members
      for (const team of teams) {
        console.log(`\nTeam: ${team.name}`);
        const members = await coreApi.getTeamMembers(projectName, team.id);
        
        console.log('Team members:');
        members.forEach(member => {
          console.log(`- ${member.identity.displayName}`);
          console.log(`  ID: ${member.identity.id}`);
          console.log(`  Unique Name: ${member.identity.uniqueName} (usually email)`);
        });
      }
    } catch (error) {
      console.error('Error getting team members:', error.message);
    }
    
    // Method 2: Search for specific users
    try {
      // If you know part of the user's name or email
      const searchCriteria = 'displayName';  // Replace with partial name, email, etc.
      const identities = await identityApi.readIdentities(null, null, searchCriteria);
      
      if (identities && identities.length > 0) {
        console.log('\nFound users by search:');
        identities.forEach(identity => {
          console.log(`- ${identity.providerDisplayName || identity.displayName}`);
          console.log(`  ID: ${identity.id}`);
          console.log(`  Unique Name: ${identity.uniqueName || identity.signInAddress}`);
        });
      } else {
        console.log(`No users found matching '${searchCriteria}'`);
      }
    } catch (error) {
      console.error('Error searching for users:', error.message);
    }
    
    // Method 3: Get project administrators
    try {
      const securityApi = await connection.getSecurityApi();
      const projectAdminGroup = await securityApi.queryGroups({
        scopeIds: [projectName],
        recursionLevel: "All"
      });
      
      // Filter for Project Administrators
      const adminGroup = projectAdminGroup.find(g => g.displayName === "Project Administrators");
      
      if (adminGroup) {
        console.log('\nProject Administrators:');
        const members = await securityApi.readMembers(adminGroup.descriptor);
        
        for (const memberId of members) {
          // Get identity details for each member
          const identity = await identityApi.readIdentity(memberId);
          console.log(`- ${identity.displayName}`);
          console.log(`  ID: ${identity.id}`);
        }
      }
    } catch (error) {
      console.error('Error getting project administrators:', error.message);
    }
    
    console.log('\nUse these IDs in your pull request reviewers list.');
  } catch (error) {
    console.error('Error finding user IDs:', error);
    throw error;
  }
}

// Execute the function
findUserIds().catch(error => {
  console.error('Script failed');
});














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
