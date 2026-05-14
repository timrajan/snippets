   const { gitClient, witClient, testClient } = await connectToAzureDevOps(ORG_URL, PAT);
        const repositoryId = await getRepositoryId(gitClient, PROJECT_ID, REPO_NAME);
        const excelBuffer = await downloadExcelBuffer(gitClient, repositoryId, PROJECT_ID, FILE_PATH, SOURCE_BRANCH_NAME);

        // --- STEP 4: PARSE BINARY FILE INTO DATA ARRAYS ---
        console.log("[START] Step 4: Passing verified buffer into SheetJS parser engine...");
        const workbook = XLSX.read(excelBuffer, { type: "buffer" });
        console.log("[DEBUG] SheetJS successfully unpacked the workbook package.");



async function downloadExcelBuffer(gitClient: IGitApi, repositoryId: string, projectId: string, filePath: string, branchRef: string): Promise<Buffer> {
    console.log("[START] Step 3: Downloading remote Excel file spreadsheet buffer...");
    
    // Execute call matching your other working project format
    const response = await gitClient.getItem(
        repositoryId,
        filePath,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true, // includeContent
        //{ version: refstargetBranchName, versionType: GitInterfaces.GitVersionType.Branch },
        { version: branchRef, versionType: 0 }, 
        true, // includeContentMetadata
        false, // latestProcessedChange
        false  // download
    );

    if (!response) {
        throw new Error(`Azure DevOps returned an empty response. Verify that the file "${filePath}" exists.`);
    }

    // ============================================================================
    // DEFENSIVE EXTRACTION LAYER: Handles any response format dynamically
    // ============================================================================
    
    // Check A: Is the response a direct binary Buffer?
    if (Buffer.isBuffer(response)) {
        console.log(`[DEBUG] Data returned natively as a pre-allocated binary Buffer.`);
        return response;
    }

    // Check B: Is it inside an object property container wrapper (.content)?
    const contentPayload = (response as any).content;
    if (contentPayload !== undefined && contentPayload !== null) {
        if (Buffer.isBuffer(contentPayload)) {
            return contentPayload;
        }
        console.log(`[DEBUG] Extracting spreadsheet contents directly from content string wrapper.`);
        return Buffer.from(contentPayload, "binary");
    }

    // Check C: Is it an active stream? Only call .on if the method exists!
    const readableStream: any = (response as any).stream || response;
    if (readableStream && typeof readableStream.on === 'function') {
        console.log("[DEBUG] Data returned as an active stream channel. Resolving chunks...");
        const chunks: Buffer[] = [];
        
        return new Promise<Buffer>((resolve, reject) => {
            readableStream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
            readableStream.on('end', () => {
                const finalBuffer = Buffer.concat(chunks);
                console.log(`[DEBUG] Stream completed via fallback reader (${finalBuffer.length} bytes).`);
                resolve(finalBuffer);
            });
            readableStream.on('error', (err: any) => reject(err));
        });
    }

    // Check D: Absolute Fallback - Attempt to stringify the raw object straight to binary
    console.log("[DEBUG] Fallback: Treating raw response structure as direct data mapping.");
    return Buffer.from(response as any);
}
