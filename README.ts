Argument of type '{ comments: { text: string; }[]; status: CommentThreadStatus; }' is not assignable to parameter of type 'GitPullRequestCommentThread'.

if (commentContent) {
      // Create a thread with a comment
      const thread = {
        comments: [
          {
            text: commentContent // Using 'text' property which is correct for the API
          }
        ],
        status: CommentThreadStatus.Active
      };
      
      await gitApi.createThread(
        thread,
        repositoryId,
        pullRequestId,
        project
      );
      
      console.log(`Added comment to PR #${pullRequestId}`);
