await gitApi.createThread(
  {
    comments: [{ content: commentContent }],
    status: CommentThreadStatus.Active
  },
  repositoryId,
  pullRequestId,
  project
);
