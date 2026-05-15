async function pushExcelToAzureRepos(gitClient: IGitApi, repositoryId: string, projectId: string, filePath: string, branchPath: string, buffer: Buffer): Promise<void> {
    console.log("[START] Step 8: Recompiling cell elements and executing cloud commit push into branch...");
    const base64Content = buffer.toString("base64");
    const simpleBranchName = branchPath.replace("refs/heads/", "");

    const branchRefs = await gitClient.getRefs(repositoryId, projectId, `heads/${simpleBranchName}`);
    if (!branchRefs || branchRefs.length === 0 || !branchRefs[0].objectId) {
        throw new Error(`Failed to locate target branch metadata for refs/heads/${simpleBranchName}`);
    }
    const oldObjectId = branchRefs[0].objectId;

    const pushPayload = {
        refUpdates: [{ name: branchPath, oldObjectId: oldObjectId }],
        commits: [{
            comment: "Automated update: Populated missing ADOIDs and mapped Test Suite entries",
            changes: [{
                changeType: 2, // 2 = Edit
                item: { path: filePath },
                newContent: { content: base64Content, contentType: 1 } // 1 = Base64
            }]
        }]
    };

    await gitClient.createPush(pushPayload, repositoryId, projectId);
    console.log("[SUCCESS] Step 8: Cloud remote repository synchronization is COMPLETE. File updated successfully.\n");
}

CRITICAL ERROR: Execution script failed mid-transit: TF401021: 'test' is not a valid name for a Git ref. Visit https://go.microsoft.com/fwlink/?LinkId=800646 for more information on Git ref naming.
