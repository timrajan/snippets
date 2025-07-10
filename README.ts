// Get work item with tags
const workItem = await workItemApi.getWorkItem(workItemId, null, null, "System.Tags");

// Extract tags
const tags = workItem.fields["System.Tags"];
console.log("Tags:", tags);
