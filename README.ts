import * as XLSX from 'xlsx';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';

interface TestCaseAttachment {
  id: string;
  url: string;
  fileName: string;
  size?: number;
}

type ExcelRow = Record<string, unknown>;

/**
 * Finds a row in a specific sheet where SERIAL_NUMBER matches the given id
 * @param workItemApi - The Work Item Tracking API instance
 * @param attachment - The TestCaseAttachment object
 * @param sheetName - The name of the sheet to search in
 * @param id - The ID value to match against SERIAL_NUMBER column
 * @returns Promise<ExcelRow | null> - The matching row or null if not found
 */
async function getRowBySerialNumber(
  workItemApi: IWorkItemTrackingApi,
  attachment: TestCaseAttachment,
  sheetName: string,
  id: number | string
): Promise<ExcelRow | null> {
  // Download the attachment content
  const stream = await workItemApi.getAttachmentContent(attachment.id);

  const chunks: Buffer[] = [];
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

  // Read Excel workbook
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // Check if sheet exists
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet "${sheetName}" not found in the Excel file`);
  }

  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to array of row objects
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  // Loop through rows and find matching SERIAL_NUMBER
  for (const row of rows) {
    const serialNumber = row['SERIAL_NUMBER'];
    if (serialNumber?.toString() === id.toString()) {
      return row;
    }
  }

  return null;
}
