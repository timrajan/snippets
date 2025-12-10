import * as azdev from 'azure-devops-node-api';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

interface TestCaseAttachment {
  id: string;
  url: string;
  fileName: string;
  size?: number;
}

/**
 * Fetches all attachments for a specific test case using Work Item Tracking API
 * @param workItemApi - The Work Item Tracking API instance
 * @param testCaseId - The ID of the test case (work item)
 * @returns Promise<TestCaseAttachment[]> - List of attachments
 */
async function getTestCaseAttachments(
  workItemApi: IWorkItemTrackingApi,
  testCaseId: number
): Promise<TestCaseAttachment[]> {
  // Get the work item with relations (attachments are relations)
  const workItem: WorkItem = await workItemApi.getWorkItem(
    testCaseId,
    undefined,
    undefined,
    4 // WorkItemExpand.Relations
  );

  if (!workItem.relations) {
    return [];
  }

  // Filter only attachments
  const attachments: TestCaseAttachment[] = workItem.relations
    .filter((relation) => relation.rel === 'AttachedFile')
    .map((relation) => {
      const url = relation.url || '';
      const attributes = relation.attributes || {};
      
      // Extract attachment ID from URL
      // URL format: https://dev.azure.com/{org}/_apis/wit/attachments/{attachmentId}
      const attachmentId = url.split('/').pop() || '';

      return {
        id: attachmentId,
        url: url,
        fileName: attributes['name'] as string || '',
        size: attributes['resourceSize'] as number,
      };
    });

  return attachments;
}

// ============================================================================
// Usage Example
// ============================================================================

async function main() {
  const orgUrl = 'https://dev.azure.com/your-organization';
  const pat = 'your-personal-access-token';

  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  
  // Use Work Item Tracking API instead of Test API
  const workItemApi = await connection.getWorkItemTrackingApi();

  const testCaseId = 12345;
  const attachments = await getTestCaseAttachments(workItemApi, testCaseId);

  console.log('Attachments:', attachments);
}

main();
