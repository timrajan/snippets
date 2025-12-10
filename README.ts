/**
 * Gets all sheet names from an Excel attachment
 * @param workItemApi - The Work Item Tracking API instance
 * @param attachment - The TestCaseAttachment object
 * @returns Promise<string[]> - Array of sheet names
 */
async function getSheetNames(
  workItemApi: IWorkItemTrackingApi,
  attachment: TestCaseAttachment
): Promise<string[]> {
  // Download the attachment content
  const stream = await workItemApi.getAttachmentContent(attachment.id);

  // Convert stream to buffer
  const chunks: Buffer[] = [];
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

  // Read Excel and return sheet names
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  return workbook.SheetNames;
}
