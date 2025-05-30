workItem.fields["Microsoft.VSTS.TCM.LocalDataSource"]


const workItem = await witApi.getWorkItem(
    workItemId,
    ["Microsoft.VSTS.TCM.LocalDataSource"],
    null,
    null,
    'all' // expand
);
