// Get work item with tags
const workItem = await workItemApi.getWorkItem(workItemId, null, null, "System.Tags");

// Extract tags
const tags = workItem.fields["System.Tags"];
console.log("Tags:", tags);

return new TSError(diagnosticText, diagnosticCodes, diagnostics);

https://1drv.ms/u/c/826b11a43e37bdb6/ERuC76vsstlJpwVm_M55ShMBlmfJx_Nw6IgpdMIQCdg2IA?e=bZVErA
