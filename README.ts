- task: PublishTestResults@2
  displayName: 'Publish Test Results'
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**\*.xml'
    searchFolder: '$(PuppeteerDir)\test-results\junit'
    mergeTestResults: true
    failTaskOnFailedTests: true
    failTaskOnMissingResultsFile: true
  continueOnError: true
  condition: succeededOrFailed()
  timeoutInMinutes: 5
