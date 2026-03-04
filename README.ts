parameters:
  - name: mode
    displayName: 'Mode'
    type: string
    default: 'smoke'
    values:
      - smoke
      - regression
      - full

  - name: type
    displayName: 'Type'
    type: string
    default: 'ui'
    values:
      - ui
      - api
      - integration

  - name: environment
    displayName: 'Environment'
    type: string
    default: 'dev'
    values:
      - dev
      - staging
      - production

variables:
  - name: testSuiteId
    ${{ if and(eq(parameters.mode, 'smoke'), eq(parameters.type, 'ui'), eq(parameters.environment, 'dev')) }}:
      value: '1,2,3,4,5'
    ${{ elseif and(eq(parameters.mode, 'smoke'), eq(parameters.type, 'api'), eq(parameters.environment, 'dev')) }}:
      value: '10,11,12'
    ${{ elseif and(eq(parameters.mode, 'regression'), eq(parameters.type, 'ui'), eq(parameters.environment, 'staging')) }}:
      value: '20,21,22,23,24,25'
    ${{ elseif and(eq(parameters.mode, 'full'), eq(parameters.type, 'ui'), eq(parameters.environment, 'production')) }}:
      value: '1,2,3,4,5,10,11,12,20,21,22,23,24,25'
    ${{ else }}:
      value: '1,2,3'

steps:
  - script: |
      echo "Mode: ${{ parameters.mode }}"
      echo "Type: ${{ parameters.type }}"
      echo "Environment: ${{ parameters.environment }}"
      echo "Test Suite: $(testSuiteId)"
    displayName: 'Show selected configuration'

  - script: npm run testbysuite -- --a=$(testSuiteId) --reset=false
    displayName: 'Run tests'
