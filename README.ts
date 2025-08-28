import { Client } from '@azure/msal-node';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface AuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

interface SharePointConfig {
  siteUrl: string;
  driveId?: string;
  itemId?: string;
}

export class SharePointExcelReader {
  private accessToken: string = '';
  
  constructor(
    private authConfig: AuthConfig,
    private sharePointConfig: SharePointConfig
  ) {}

  /**
   * Authenticate and get access token using client credentials flow
   */
  private async authenticate(): Promise<void> {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.authConfig.tenantId}/oauth2/v2.0/token`;
      
      const params = new URLSearchParams();
      params.append('client_id', this.authConfig.clientId);
      params.append('client_secret', this.authConfig.clientSecret);
      params.append('scope', 'https://graph.microsoft.com/.default');
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Extract site ID and drive ID from SharePoint URL
   */
  private async extractSiteInfo(sharePointUrl: string): Promise<{siteId: string, driveId: string}> {
    try {
      // Extract hostname and site path from URL
      const url = new URL(sharePointUrl);
      const hostname = url.hostname;
      const pathParts = url.pathname.split('/');
      const siteName = pathParts[2]; // Assuming /sites/sitename structure

      // Get site information
      const siteApiUrl = `https://graph.microsoft.com/v1.0/sites/${hostname}:/sites/${siteName}`;
      
      const siteResponse = await axios.get(siteApiUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const siteId = siteResponse.data.id;

      // Get default drive (document library)
      const driveResponse = await axios.get(`https://graph.microsoft.com/v1.0/sites/${siteId}/drive`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const driveId = driveResponse.data.id;

      return { siteId, driveId };
    } catch (error) {
      console.error('Error extracting site info:', error);
      throw error;
    }
  }

  /**
   * Get file content from SharePoint
   */
  private async getFileContent(fileUrl: string): Promise<Buffer> {
    try {
      // Extract file path from SharePoint URL
      const url = new URL(fileUrl);
      const filePath = decodeURIComponent(url.pathname);
      
      // Get site and drive info
      const { driveId } = await this.extractSiteInfo(fileUrl);
      
      // Extract just the filename and path within the drive
      const pathParts = filePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Search for the file by name
      const searchUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root/search(q='${fileName}')`;
      
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (searchResponse.data.value.length === 0) {
        throw new Error('File not found');
      }

      const fileItem = searchResponse.data.value[0];
      const downloadUrl = fileItem['@microsoft.graph.downloadUrl'];

      // Download file content
      const fileResponse = await axios.get(downloadUrl, {
        responseType: 'arraybuffer'
      });

      return Buffer.from(fileResponse.data);
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }

  /**
   * Read Excel data from SharePoint
   */
  async readExcelData(sharePointFileUrl: string, sheetName?: string): Promise<any[]> {
    try {
      // Authenticate first
      await this.authenticate();

      // Get file content
      console.log('Downloading Excel file...');
      const fileBuffer = await this.getFileContent(sharePointFileUrl);

      // Parse Excel file
      console.log('Parsing Excel file...');
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      // Get sheet name (use first sheet if not specified)
      const targetSheetName = sheetName || workbook.SheetNames[0];
      
      if (!workbook.Sheets[targetSheetName]) {
        throw new Error(`Sheet "${targetSheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
      }

      // Convert sheet to JSON
      const worksheet = workbook.Sheets[targetSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Successfully read ${jsonData.length} rows from sheet "${targetSheetName}"`);
      return jsonData;

    } catch (error) {
      console.error('Error reading Excel data:', error);
      throw error;
    }
  }

  /**
   * Get all sheet names from Excel file
   */
  async getSheetNames(sharePointFileUrl: string): Promise<string[]> {
    try {
      await this.authenticate();
      const fileBuffer = await this.getFileContent(sharePointFileUrl);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      return workbook.SheetNames;
    } catch (error) {
      console.error('Error getting sheet names:', error);
      throw error;
    }
  }
}
