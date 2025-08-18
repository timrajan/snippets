// network-logger.ts
import { Page } from 'puppeteer';
import * as fs from 'fs';

interface NetworkEntry {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  type: string;
  size?: string;
  time?: string;
  initiator?: string;
  headers?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  postData?: string;
  remoteAddress?: { ip: string; port: number };
  fromCache?: boolean;
  protocol?: string;
}

class NetworkLogger {
  private networkEntries: NetworkEntry[] = [];
  private page: Page | null = null;
  private startTime: number = 0;

  startLog(page: Page): void {
    this.page = page;
    this.networkEntries = [];
    this.startTime = Date.now();

    // Enable request interception
    page.setRequestInterception(true);

    // Capture requests
    page.on('request', (request) => {
      const entry: NetworkEntry = {
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        type: request.resourceType(),
        initiator: this.getInitiator(request),
        headers: request.headers(),
        postData: request.postData() || undefined,
        protocol: new URL(request.url()).protocol
      };

      this.networkEntries.push(entry);
      request.continue();
    });

    // Capture responses
    page.on('response', (response) => {
      const request = response.request();
      const existingEntry = this.networkEntries.find(
        entry => entry.url === response.url() && entry.method === request.method()
      );

      if (existingEntry) {
        existingEntry.status = response.status();
        existingEntry.statusText = response.statusText();
        existingEntry.responseHeaders = response.headers();
        existingEntry.size = this.getResponseSize(response);
        existingEntry.time = this.calculateTime(existingEntry.timestamp);
        existingEntry.remoteAddress = response.remoteAddress();
        existingEntry.fromCache = response.fromCache();
      }
    });

    // Capture failed requests
    page.on('requestfailed', (request) => {
      const existingEntry = this.networkEntries.find(
        entry => entry.url === request.url() && entry.method === request.method()
      );

      if (existingEntry) {
        existingEntry.status = 0;
        existingEntry.statusText = request.failure()?.errorText || 'Failed';
      }
    });

    console.log('Network logging started');
  }

  async stopLog(filename?: string): Promise<string> {
    if (!this.page) {
      throw new Error('Network logging not started. Call startLog() first.');
    }

    // Remove listeners
    this.page.removeAllListeners('request');
    this.page.removeAllListeners('response');
    this.page.removeAllListeners('requestfailed');

    let logFile: string;
    
    if (filename) {
      // Add timestamp to provided filename
      const timestamp = new Date().toISOString();
      const filenameParts = filename.split('.');
      const name = filenameParts[0];
      const extension = filenameParts[1] || 'txt';
      logFile = `${name}-${timestamp}.${extension}`;
    } else {
      // Default filename with timestamp
      const timestamp = new Date().toISOString();
      logFile = `network-log-${timestamp}.txt`;
    }

    const content = this.generateNetworkReport();

    fs.writeFileSync(logFile, content);
    console.log(`Network log saved to: ${logFile}`);
    console.log(`Total network entries: ${this.networkEntries.length}`);

    return logFile;
  }

  private getInitiator(request: any): string {
    try {
      const frame = request.frame();
      return frame ? frame.url() : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getResponseSize(response: any): string {
    const contentLength = response.headers()['content-length'];
    if (contentLength) {
      const bytes = parseInt(contentLength);
      return this.formatBytes(bytes);
    }
    return 'unknown';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private calculateTime(timestamp: string): string {
    const requestTime = new Date(timestamp).getTime();
    const duration = Date.now() - requestTime;
    return `${duration}ms`;
  }

  private generateNetworkReport(): string {
    let report = '='.repeat(80) + '\n';
    report += 'NETWORK ACTIVITY REPORT\n';
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Requests: ${this.networkEntries.length}\n`;
    report += '='.repeat(80) + '\n\n';

    // Summary section
    const summary = this.generateSummary();
    report += 'SUMMARY\n';
    report += '-'.repeat(40) + '\n';
    report += `Total Requests: ${summary.totalRequests}\n`;
    report += `Successful (2xx): ${summary.successful}\n`;
    report += `Client Errors (4xx): ${summary.clientErrors}\n`;
    report += `Server Errors (5xx): ${summary.serverErrors}\n`;
    report += `Failed Requests: ${summary.failed}\n`;
    report += `Cached Responses: ${summary.cached}\n`;
    report += `Unique Domains: ${summary.domains.length}\n`;
    report += `Domains: ${summary.domains.join(', ')}\n\n`;

    // Resource type breakdown
    report += 'RESOURCE TYPES\n';
    report += '-'.repeat(40) + '\n';
    Object.entries(summary.resourceTypes).forEach(([type, count]) => {
      report += `${type}: ${count}\n`;
    });
    report += '\n';

    // Detailed entries
    report += 'DETAILED NETWORK ENTRIES\n';
    report += '-'.repeat(80) + '\n';

    this.networkEntries.forEach((entry, index) => {
      report += `\n[${index + 1}] ${entry.method} ${entry.url}\n`;
      report += `Time: ${entry.timestamp}\n`;
      
      if (entry.status !== undefined) {
        const statusIcon = this.getStatusIcon(entry.status);
        report += `Status: ${statusIcon} ${entry.status} ${entry.statusText || ''}\n`;
      }
      
      report += `Type: ${entry.type}\n`;
      
      if (entry.size) {
        report += `Size: ${entry.size}\n`;
      }
      
      if (entry.time) {
        report += `Duration: ${entry.time}\n`;
      }
      
      if (entry.fromCache) {
        report += `From Cache: ✓\n`;
      }
      
      if (entry.remoteAddress) {
        report += `Remote: ${entry.remoteAddress.ip}:${entry.remoteAddress.port}\n`;
      }

      // Request headers
      if (entry.headers && Object.keys(entry.headers).length > 0) {
        report += `Request Headers:\n`;
        Object.entries(entry.headers).forEach(([key, value]) => {
          report += `  ${key}: ${value}\n`;
        });
      }

      // Response headers (key ones only)
      if (entry.responseHeaders) {
        const importantHeaders = ['content-type', 'content-length', 'cache-control', 'set-cookie'];
        const filteredHeaders = Object.entries(entry.responseHeaders)
          .filter(([key]) => importantHeaders.includes(key.toLowerCase()));
        
        if (filteredHeaders.length > 0) {
          report += `Response Headers:\n`;
          filteredHeaders.forEach(([key, value]) => {
            report += `  ${key}: ${value}\n`;
          });
        }
      }

      // POST data
      if (entry.postData) {
        const truncatedData = entry.postData.length > 200 
          ? entry.postData.substring(0, 200) + '...' 
          : entry.postData;
        report += `POST Data: ${truncatedData}\n`;
      }

      report += '-'.repeat(40) + '\n';
    });

    return report;
  }

  private getStatusIcon(status: number): string {
    if (status >= 200 && status < 300) return '✓';
    if (status >= 300 && status < 400) return '↻';
    if (status >= 400 && status < 500) return '⚠';
    if (status >= 500) return '✗';
    if (status === 0) return '✗';
    return '?';
  }

  private generateSummary() {
    const summary = {
      totalRequests: this.networkEntries.length,
      successful: 0,
      clientErrors: 0,
      serverErrors: 0,
      failed: 0,
      cached: 0,
      domains: [] as string[],
      resourceTypes: {} as Record<string, number>
    };

    const domainSet = new Set<string>();

    this.networkEntries.forEach(entry => {
      // Status code analysis
      if (entry.status !== undefined) {
        if (entry.status >= 200 && entry.status < 300) summary.successful++;
        else if (entry.status >= 400 && entry.status < 500) summary.clientErrors++;
        else if (entry.status >= 500) summary.serverErrors++;
        else if (entry.status === 0) summary.failed++;
      }

      // Cache analysis
      if (entry.fromCache) summary.cached++;

      // Domain analysis
      try {
        const domain = new URL(entry.url).hostname;
        domainSet.add(domain);
      } catch {
        // Invalid URL
      }

      // Resource type analysis
      summary.resourceTypes[entry.type] = (summary.resourceTypes[entry.type] || 0) + 1;
    });

    summary.domains = Array.from(domainSet);
    return summary;
  }

  // Get network entries for custom analysis
  getNetworkEntries(): NetworkEntry[] {
    return [...this.networkEntries];
  }

  // Get entries for specific domain
  getEntriesForDomain(domain: string): NetworkEntry[] {
    return this.networkEntries.filter(entry => {
      try {
        return new URL(entry.url).hostname === domain;
      } catch {
        return false;
      }
    });
  }

  // Get failed requests
  getFailedRequests(): NetworkEntry[] {
    return this.networkEntries.filter(entry => 
      entry.status === 0 || (entry.status && entry.status >= 400)
    );
  }
}

export default NetworkLogger;
