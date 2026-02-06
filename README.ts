import * as GitApi from "azure-devops-node-api/GitApi";
import { GitVersionType } from "azure-devops-node-api/interfaces/GitInterfaces";
import * as XLSX from "xlsx";

export interface TestCaseAttachment {
  id: string;
  fileName: string;
  url: string;
  size: number;
}

async function getFileContent(
  gitApi: GitApi.IGitApi,
  fileName: string
): Promise<TestCaseAttachment> {
  const project = "your-project";
  const repoName = "your-repo";
  const filePath = `/path/to/attachments/${fileName}`;

  const item = await gitApi.getItemContent(
    repoName,
    filePath,
    project,
    undefined,
    undefined,
    true,
    undefined,
    undefined,
    {
      version: "master",
      versionType: GitVersionType.Branch,
    }
  );

  const chunks: Buffer[] = [];
  for await (const chunk of item) {
    chunks.push(Buffer.from(chunk));
  }
  const content = Buffer.concat(chunks);

  const orgUrl = "https://dev.azure.com/your-organization";
  const url = `${orgUrl}/${project}/_apis/git/repositories/${repoName}/items?path=${encodeURIComponent(filePath)}&versionDescriptor.version=master&versionDescriptor.versionType=branch&api-version=7.1`;

  return {
    id: `${repoName}:${filePath}`,
    fileName,
    url,
    size: content.length,
  };
}
