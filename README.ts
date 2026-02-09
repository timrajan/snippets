// Parse the git URL
const url = new URL(gitUrl);
const pathParts = url.pathname.split("/");
const project = pathParts[2];
const repoName = pathParts[4];
const filePath = url.searchParams.get("path") || "";

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

const stream = item as unknown as NodeJS.ReadableStream;

const chunks: Buffer[] = [];
const buffer = await new Promise<Buffer>((resolve, reject) => {
  stream.on("data", (chunk: Buffer) => chunks.push(chunk));
  stream.on("end", () => resolve(Buffer.concat(chunks)));
  stream.on("error", reject);
});

// Read Excel workbook
const workbook = XLSX.read(buffer, { type: "buffer" });

if (!workbook.SheetNames.includes(sheetName)) {
  throw new Error(`Sheet "${sheetName}" not found in the Excel file`);
}

const worksheet = workbook.Sheets[sheetName];
const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

for (const row of rows) {
  const testCaseID = row["ID"];
  if (testCaseID?.toString() === id.toString()) {
    return row;
  }
}
return null;
