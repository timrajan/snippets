import * as azdev from "azure-devops-node-api";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { GitPullRequestCommentThread } from "azure-devops-node-api/interfaces/GitInterfaces";
import { Comment } from "azure-devops-node-api/interfaces/GitInterfaces";
import { CommentThreadStatus } from "azure-devops-node-api/interfaces/GitInterfaces";
import { GitPullRequestReviewVote } from "azure-devops-node-api/interfaces/GitInterfaces";
import { VoteResult } from "azure-devops-node-api/interfaces/GitInterfaces";

/**
 * Approves a pull request in Azure DevOps
 * 
 * @param orgUrl - Organization URL (e.g., https://dev.azure.com/yourorg)
 * @param personalAccessToken - Azure DevOps PAT with appropriate permissions
 * @param project - Project name
 * @param repositoryId - Repository ID
 * @param pullRequestId - ID of the pull request to approve
 * @param commentContent - Optional comment to add with the approval
 * @returns Promise that resolves when the PR is approved
 */
async function approvePullRequest(
  orgUrl: string,
  personalAccessToken: string,
  project: string,
  repositoryId: string,
  pullRequestId: number,
  commentContent?: string
): Promise<void> {
  try {
    // Create a connection to Azure DevOps
    const authHandler = azdev.getPersonalAccessTokenHandler(personalAccessToken);
    const connection = new azdev.WebApi(orgUrl, authHandler);
    
    // Get the Git API client
    const gitApi: IGitApi = await connection.getGitApi();
    
    // Create the vote object (10 = approved)
    const vote: GitPullRequestReviewVote = {
      vote: VoteResult.Approved, // 10 = Approved
      reviewerId: undefined, // Uses the authenticated user
    };
    
    // Vote to approve the PR
    await gitApi.createPullRequestReviewers(
      [vote],
      repositoryId,
      pullRequestId,
      project
    );
    
    console.log(`Successfully approved PR #${pullRequestId}`);
    
    // Optionally add a comment
    if (commentContent) {
      const comment: Comment = {
        content: commentContent,
      };
      
      const commentThread: GitPullRequestCommentThread = {
        comments: [comment],
        status: CommentThreadStatus.Active,
      };
      
      await gitApi.createThread(
        commentThread,
        repositoryId,
        pullRequestId,
        project
      );
      
      console.log(`Added comment to PR #${pullRequestId}`);
    }
  } catch (error) {
    console.error("Error approving pull request:", error);
    throw error;
  }
}

// Example usage
async function main() {
  const orgUrl = "https://dev.azure.com/yourorganization";
  const pat = "your-personal-access-token";
  const project = "YourProject";
  const repoId = "your-repository-id";
  const prId = 123; // Pull request ID
  const comment = "LGTM! Approving this PR."; // Optional comment
  
  try {
    await approvePullRequest(orgUrl, pat, project, repoId, prId, comment);
    console.log("Pull request approved successfully");
  } catch (error) {
    console.error("Failed to approve pull request:", error);
  }
}

// Uncomment to run
// main();
