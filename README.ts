/**
   * Get Excel file using gitAPI and save to local path
   */
  async getExcelFileAndSave(
    gitAPI: any,
    repositoryId: string,
    project: string,
    filePath: string,
    branchName: string,
    localSavePath: string,
    createDirectories: boolean = true
  ): Promise<{ content: Buffer; commitId: string; savedPath: string }> {
    try {
      // Get the file content from Azure DevOps
      const response = await gitAPI.getItem(
        repositoryId,
        filePath,
        project,
        {
          version: branchName,
          versionType: 'branch',
          includeContent: true
        }
      );

      if (!response.content) {
        throw new Error('File content not found');
      }

      const buffer = Buffer.from(response.content, 'base64');
      
      // Create directories if they don't exist
      if (createDirectories) {
        const directory = path.dirname(localSavePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
          console.log(`📁 Created directory: ${directory}`);
        }
      }

      // Save the file to local path
      fs.writeFileSync(localSavePath, buffer);
      console.log(`💾 Excel file saved to: ${localSavePath}`);

      return {
        content: buffer,
        commitId: response.commitId,
        savedPath: localSavePath
      };
    } catch (error) {
      if (error.statusCode === 404) {
        throw new Error(`File '${filePath}' not found in branch '${branchName}'`);
      }
      if (error.code === 'ENOENT' || error.code === 'EACCES') {
        throw new Error(`Failed to save file to '${localSavePath}': ${error.message}`);
      }
      throw new Error(`Failed to get and save file: ${error.message || error}`);
    }
  }
