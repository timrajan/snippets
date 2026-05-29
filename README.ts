import * as fs from 'fs';
import * as path from 'path';

interface TestAttachment {
  id: string;
  fileName: string;
  url: string;
  size: number;
}

// Toggle this via env var so you don't have to change code between local/git runs
const USE_LOCAL_ATTACHMENTS = process.env.USE_LOCAL_ATTACHMENTS === 'true';
const LOCAL_ATTACHMENTS_DIR = process.env.LOCAL_ATTACHMENTS_DIR 
  || path.resolve(__dirname, '../test-attachments');

export async function getTestAttachment(fileName: string): Promise<TestAttachment> {
  if (USE_LOCAL_ATTACHMENTS) {
    return getLocalTestAttachment(fileName);
  }
  return getGitTestAttachment(fileName);
}

function getLocalTestAttachment(fileName: string): TestAttachment {
  const filePath = path.join(LOCAL_ATTACHMENTS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Local attachment not found: ${filePath}`);
  }

  const stats = fs.statSync(filePath);

  return {
    id: fileName,                          // or hash if you need stability
    fileName,
    url: `file://${filePath}`,             // or pathToFileURL(filePath).href
    size: stats.size,
  };
}

async function getGitTestAttachment(fileName: string): Promise<TestAttachment> {
  // your existing git-fetch implementation
  // ...
}
