import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config();

interface PipelineConfig {
  parameters: Record<string, any>;
  branch?: string;
}

interface RunPipelineResponse {
  id: number;
  name: string;
  url: string;
  state: string;
}

class AzurePipelineRunner {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(
    private organization: string,
    private project: string,
    private pipelineId: number,
    pat: string
  ) {
    this.baseUrl = `https://dev.azure.com/${organization}/${project}/_apis`;
    this.authHeader = `Basic ${Buffer.from(`:${pat}`).toString('base64')}`;
  }

  async runPipeline(config: PipelineConfig): Promise<RunPipelineResponse> {
    const url = `${this.baseUrl}/pipelines/${this.pipelineId}/runs?api-version=7.0`;
    
    const body = {
      resources: {
        repositories: {
          self: {
            refName: config.branch || "refs/heads/main"
          }
        }
      },
      templateParameters: config.parameters
    };

    console.log('🚀 Starting pipeline run...');
    console.log('Parameters:', JSON.stringify(config.parameters, null, 2));

    try {
      const response = await axios.post(url, body, {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;
      console.log('✅ Pipeline started successfully!');
      console.log(`📋 Run ID: ${result.id}`);
      console.log(`🔗 URL: ${result._links.web.href}`);
      
      return result;
    } catch (error: any) {
      console.error('❌ Failed to run pipeline:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Error:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      throw error;
    }
  }

  async getPipelineRun(runId: number) {
    const url = `${this.baseUrl}/pipelines/${this.pipelineId}/runs/${runId}?api-version=7.0`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': this.authHeader
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get pipeline run:', error);
      throw error;
    }
  }

  async waitForCompletion(runId: number, pollIntervalMs: number = 30000): Promise<void> {
    console.log('⏳ Waiting for pipeline completion...');
    
    while (true) {
      const run = await this.getPipelineRun(runId);
      console.log(`📊 Status: ${run.state} | Result: ${run.result || 'In Progress'}`);
      
      if (run.state === 'completed') {
        if (run.result === 'succeeded') {
          console.log('🎉 Pipeline completed successfully!');
        } else {
          console.log(`❌ Pipeline failed with result: ${run.result}`);
        }
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }
}

// Main execution function
async function main() {
  const organization = process.env.AZURE_ORG!;
  const project = process.env.AZURE_PROJECT!;
  const pipelineId = parseInt(process.env.PIPELINE_ID!);
  const pat = process.env.AZURE_PAT!;

  if (!organization || !project || !pipelineId || !pat) {
    console.error('❌ Missing required environment variables. Check your .env file.');
    process.exit(1);
  }

  // Load configuration
  const configPath = path.join(__dirname, '../pipeline-config.json');
  const config: PipelineConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Create runner and execute
  const runner = new AzurePipelineRunner(organization, project, pipelineId, pat);
  
  try {
    const result = await runner.runPipeline(config);
    
    // Optionally wait for completion
    const shouldWait = process.argv.includes('--wait');
    if (shouldWait) {
      await runner.waitForCompletion(result.id);
    }
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { AzurePipelineRunner, PipelineConfig };
