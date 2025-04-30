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
