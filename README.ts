import { IGitApi } from "azure-devops-node-api/GitApi";
import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";

async function downloadExcelBuffer(
    gitClient: IGitApi,
    repositoryId: string,
    projectId: string,
    filePath: string,
    branchRef: string
): Promise<Buffer> {
    console.log(`[START] Step 3: Streaming "${filePath}" from branch "${branchRef}"...`);

    const stream = await gitClient.getItemContent(
        repositoryId,
        filePath,
        projectId,                                                       // project
        undefined,                                                       // scopePath
        undefined,                                                       // recursionLevel
        undefined,                                                       // includeContentMetadata
        undefined,                                                       // latestProcessedChange
        false,                                                           // download (false = inline)
        { version: branchRef, versionType: GitInterfaces.GitVersionType.Branch },
        true,                                                            // includeContent
        false,                                                           // resolveLfs
        false                                                            // sanitize
    );

    if (!stream) {
        throw new Error(
            `Azure DevOps returned an empty stream for "${filePath}". ` +
            `Verify the file exists on branch "${branchRef}".`
        );
    }

    return await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer | string) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on("end", () => {
            const buffer = Buffer.concat(chunks);
            console.log(`[DEBUG] Download complete: ${buffer.length} bytes.`);
            resolve(buffer);
        });
        stream.on("error", reject);
    });
}
