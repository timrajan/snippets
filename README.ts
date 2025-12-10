// ============================================================================
// Usage Example
// ============================================================================

/*
async function main() {
  const orgUrl = 'https://dev.azure.com/your-organization';
  const pat = 'your-personal-access-token';

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  const workItemApi = await connection.getWorkItemTrackingApi();

  const testCaseId = 12345;
  const fileName = 'SampleExcel.xlsx';

  const attachment = await getTestCaseAttachment(workItemApi, testCaseId, fileName);

  if (attachment) {
    console.log('Found attachment:', attachment);
    // Output: { id: 'guid-here', url: '...', fileName: 'SampleExcel.xlsx', size: 1234 }
  } else {
    console.log('Attachment not found');
  }
}


const orgUrl = 'https://dev.azure.com/your-organization';
  const pat = 'your-personal-access-token';

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  const workItemApi = await connection.getWorkItemTrackingApi();

/**
 * Fetches a specific attachment by filename from a test case
 * @param workItemApi - The Work Item Tracking API instance
 * @param testCaseId - The ID of the test case (work item)
 * @param fileName - The name of the file to retrieve
 * @returns Promise<TestCaseAttachment | null> - The matching attachment or null if not found
 */
async function getTestCaseAttachment(
  workItemApi: IWorkItemTrackingApi,
  testCaseId: number,
  fileName: string
): Promise<TestCaseAttachment | null> {
  // Get the work item with relations (attachments are relations)
  const workItem: WorkItem = await workItemApi.getWorkItem(
    testCaseId,
    undefined,
    undefined,
    4 // WorkItemExpand.Relations
  );

  if (!workItem.relations) {
    return null;
  }

  // Find the attachment that matches the filename
  const attachmentRelation = workItem.relations.find((relation) => {
    if (relation.rel !== 'AttachedFile') {
      return false;
    }
    const attributes = relation.attributes || {};
    const attachmentName = (attributes['name'] as string) || '';
    return attachmentName.toLowerCase() === fileName.toLowerCase();
  });

  if (!attachmentRelation) {
    return null;
  }

  const url = attachmentRelation.url || '';
  const attributes = attachmentRelation.attributes || {};
  const attachmentId = url.split('/').pop() || '';

  const attachment: TestCaseAttachment = {
    id: attachmentId,
    url: url,
    fileName: attributes['name'] as string || '',
    size: attributes['resourceSize'] as number,
  };

  return attachment;
}
