But honestly, this is a lot of overhead. Every build you're encrypting the PAT and then immediately decrypting it. It's pointless if both the encrypted file and the keys file are on the same machine.
The cleaner question to ask is — why is the ps1 script encrypting the PAT on every build? That encryption is meant to protect secrets at rest, not during a build that lasts a few minutes. I'd suggest removing the encryption step from the pipeline and just passing the PAT from the variable group directly. It's already secure there.


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
  - group: 'Automation' 
  ${{ if and(eq(parameters.Type, 'Smoke'), eq(parameters.Mode, 'KK') }}:
    TestSuiteId: '111111111'
  ${{ elseif and(eq(parameters.Type, 'Smoke'), eq(parameters.Mode, 'SS') }}:
    TestSuiteId: '22222222'
  ${{ elseif and(eq(parameters.Type, 'Sit'), eq(parameters.Mode, 'KK') }}:
    TestSuiteId: '333333,444444'
  ${{ elseif and(eq(parameters.Type, 'Sit'), eq(parameters.Mode, 'SS') }}:
    TestSuiteId: '555555,666666'

steps:
  - script: |
      echo "Mode: ${{ parameters.mode }}"
      echo "Type: ${{ parameters.type }}"
      echo "Environment: ${{ parameters.environment }}"
      echo "Test Suite: $(testSuiteId)"
    displayName: 'Show selected configuration'

  - script: npm run testbysuite -- --a=$(testSuiteId) --reset=false
    displayName: 'Run tests'
