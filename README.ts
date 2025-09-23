name: Test
trigger: none
parameters:

- name: xmlParam1
  type: string
  default: ''''''
extends:
  template: /test.yml
  parameters:
    environment: Test
    variables:
    - template: /Data.yml
      parameters:       
        xmlParam1: ${{ parameters.xmlParam1 }}
    stages:
      TestHarness:
        deploy:
        - template: /Data.yml
