import { Readable } from 'stream';

// Configuration interface
interface AdoConfig {
  organizationUrl: string;
  project: string;
  personalAccessToken: string;
}

// Attachment interface from ADO API
interface TestAttachment {
  id: number;
  fileName: string;
  url: string;
  createdDate: string;
  comment?: string;
  size: number;
}

interface AttachmentListResponse {
  count: number;
  value: TestAttachment[];
}

// Result interface for downloaded Excel with buffer
interface ExcelAttachmentResult {
  fileName: string;
  buffer: Buffer;
  stream: Readable;
  size: number;
  createdDate: string;
}

/**
 * Azure DevOps Test Attachment Service
 * Handles fetching and downloading attachments from ADO test cases
 * Returns Excel files as buffers/streams for direct content reading
 */
class AdoTestAttachmentService {
  private config: AdoConfig;
  private authHeader: string;

  constructor(config: AdoConfig) {
    this.config = config;
    // Create Base64 encoded auth header for PAT authentication
    this.authHeader = `Basic ${Buffer.from(`:${config.personalAccessToken}`).toString('base64')}`;
  }

  /**
   * Fetches all attachments for a specific test case
   * @param testCaseId - The ID of the test case
   * @returns Promise<TestAttachment[]> - List of attachments
   */
  async getTestCaseAttachments(testCaseId: number): Promise<TestAttachment[]> {
    const url = `${this.config.organizationUrl}/${this.config.project}/_apis/test/TestCases/${testCaseId}/attachments?api-version=7.1-preview.1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attachments: ${response.status} ${response.statusText}`);
    }

    const data: AttachmentListResponse = await response.json();
    return data.value;
  }

  /**
   * Fetches attachments from a test run result
   * @param runId - The test run ID
   * @param resultId - The test result ID within the run
   * @returns Promise<TestAttachment[]> - List of attachments
   */
  async getTestRunResultAttachments(runId: number, resultId: number): Promise<TestAttachment[]> {
    const url = `${this.config.organizationUrl}/${this.config.project}/_apis/test/Runs/${runId}/Results/${resultId}/attachments?api-version=7.1-preview.1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch test run attachments: ${response.status} ${response.statusText}`);
    }

    const data: AttachmentListResponse = await response.json();
    return data.value;
  }

  /**
   * Downloads an attachment and returns it as a Buffer
   * @param attachmentUrl - The URL of the attachment to download
   * @returns Promise<Buffer> - The attachment content as a buffer
   */
  async downloadAttachmentAsBuffer(attachmentUrl: string): Promise<Buffer> {
    const response = await fetch(attachmentUrl, {
      method: 'GET',
      headers: {
        'Authorization': this.authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Converts a Buffer to a Readable stream
   * @param buffer - The buffer to convert
   * @returns Readable - A readable stream
   */
  bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Signal end of stream
    return stream;
  }

  /**
   * Checks if a filename is an Excel file
   * @param fileName - The filename to check
   * @returns boolean
   */
  private isExcelFile(fileName: string): boolean {
    const excelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    return excelExtensions.includes(ext);
  }

  /**
   * Filters attachments to only include Excel files
   * @param attachments - List of all attachments
   * @returns TestAttachment[] - Only Excel file attachments
   */
  filterExcelAttachments(attachments: TestAttachment[]): TestAttachment[] {
    return attachments.filter(attachment => this.isExcelFile(attachment.fileName));
  }

  /**
   * Gets Excel attachments from a test case as buffers/streams
   * @param testCaseId - The ID of the test case
   * @returns Promise<ExcelAttachmentResult[]> - Excel files with buffer and stream
   */
  async getExcelAttachmentsFromTestCase(testCaseId: number): Promise<ExcelAttachmentResult[]> {
    const attachments = await this.getTestCaseAttachments(testCaseId);
    const excelAttachments = this.filterExcelAttachments(attachments);

    if (excelAttachments.length === 0) {
      return [];
    }

    const results: ExcelAttachmentResult[] = [];

    for (const attachment of excelAttachments) {
      const buffer = await this.downloadAttachmentAsBuffer(attachment.url);
      results.push({
        fileName: attachment.fileName,
        buffer,
        stream: this.bufferToStream(buffer),
        size: attachment.size,
        createdDate: attachment.createdDate,
      });
    }

    return results;
  }

  /**
   * Gets a single Excel attachment from a test case as buffer/stream
   * @param testCaseId - The ID of the test case
   * @param fileName - Optional specific filename to retrieve
   * @returns Promise<ExcelAttachmentResult | null>
   */
  async getExcelAttachmentFromTestCase(
    testCaseId: number,
    fileName?: string
  ): Promise<ExcelAttachmentResult | null> {
    const attachments = await this.getTestCaseAttachments(testCaseId);
    let excelAttachments = this.filterExcelAttachments(attachments);

    if (fileName) {
      excelAttachments = excelAttachments.filter(
        a => a.fileName.toLowerCase() === fileName.toLowerCase()
      );
    }

    if (excelAttachments.length === 0) {
      return null;
    }

    const attachment = excelAttachments[0];
    const buffer = await this.downloadAttachmentAsBuffer(attachment.url);

    return {
      fileName: attachment.fileName,
      buffer,
      stream: this.bufferToStream(buffer),
      size: attachment.size,
      createdDate: attachment.createdDate,
    };
  }

  /**
   * Gets Excel attachments from a test run result as buffers/streams
   * @param runId - The test run ID
   * @param resultId - The test result ID
   * @returns Promise<ExcelAttachmentResult[]> - Excel files with buffer and stream
   */
  async getExcelAttachmentsFromTestRunResult(
    runId: number,
    resultId: number
  ): Promise<ExcelAttachmentResult[]> {
    const attachments = await this.getTestRunResultAttachments(runId, resultId);
    const excelAttachments = this.filterExcelAttachments(attachments);

    if (excelAttachments.length === 0) {
      return [];
    }

    const results: ExcelAttachmentResult[] = [];

    for (const attachment of excelAttachments) {
      const buffer = await this.downloadAttachmentAsBuffer(attachment.url);
      results.push({
        fileName: attachment.fileName,
        buffer,
        stream: this.bufferToStream(buffer),
        size: attachment.size,
        createdDate: attachment.createdDate,
      });
    }

    return results;
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

async function main(): Promise<void> {
  // Configuration - replace with your actual values
  const config: AdoConfig = {
    organizationUrl: 'https://dev.azure.com/your-organization',
    project: 'your-project-name',
    personalAccessToken: process.env.ADO_PAT || 'your-personal-access-token',
  };

  const service = new AdoTestAttachmentService(config);

  try {
    const testCaseId = 12345; // Replace with your test case ID

    // Example 1: Get all Excel attachments as buffers
    const excelFiles = await service.getExcelAttachmentsFromTestCase(testCaseId);
    
    for (const excel of excelFiles) {
      console.log(`File: ${excel.fileName}`);
      console.log(`Size: ${excel.size} bytes`);
      console.log(`Buffer length: ${excel.buffer.length}`);
      
      // Use the buffer directly with xlsx or exceljs library
      // Example with 'xlsx' library:
      // import * as XLSX from 'xlsx';
      // const workbook = XLSX.read(excel.buffer, { type: 'buffer' });
      // const sheetName = workbook.SheetNames[0];
      // const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      // console.log(data);

      // Example with 'exceljs' library:
      // import ExcelJS from 'exceljs';
      // const workbook = new ExcelJS.Workbook();
      // await workbook.xlsx.load(excel.buffer);
      // workbook.worksheets.forEach(sheet => {
      //   sheet.eachRow((row, rowNumber) => {
      //     console.log(`Row ${rowNumber}:`, row.values);
      //   });
      // });
    }

    // Example 2: Get a specific Excel file by name
    const specificFile = await service.getExcelAttachmentFromTestCase(
      testCaseId,
      'test-data.xlsx'
    );
    
    if (specificFile) {
      console.log(`Found: ${specificFile.fileName}`);
      // Use specificFile.buffer or specificFile.stream
    }

    // Example 3: Using the stream (e.g., for piping)
    const [firstExcel] = await service.getExcelAttachmentsFromTestCase(testCaseId);
    if (firstExcel) {
      // Pipe to a writable stream or process chunks
      firstExcel.stream.on('data', (chunk: Buffer) => {
        console.log(`Received ${chunk.length} bytes`);
      });
      firstExcel.stream.on('end', () => {
        console.log('Stream ended');
      });
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
main();

export { 
  AdoTestAttachmentService, 
  AdoConfig, 
  TestAttachment, 
  ExcelAttachmentResult 
};
