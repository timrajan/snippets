{
  "testCaseId": "TC-1001",
  "testCaseTitle": "Successful login with valid credentials",
  "preconditions": [
    "The login page is open.",
    "A valid test user exists.",
    "The username and password are available in the approved test-data source."
  ],
  "steps": [
    {
      "stepId": "1",
      "originalText": "Enter a valid username in the Username text box.",
      "actions": [
        {
          "type": "fill",
          "target": {
            "description": "Username text box",
            "accessibleName": "Username",
            "role": "textbox"
          },
          "valueRef": "testData.username"
        }
      ],
      "expectedResult": null,
      "assertions": []
    },
    {
      "stepId": "2",
      "originalText": "Enter the corresponding password in the Password text box.",
      "actions": [
        {
          "type": "fill",
          "target": {
            "description": "Password input",
            "accessibleName": "Password",
            "inputType": "password"
          },
          "valueRef": "testData.password"
        }
      ],
      "expectedResult": null,
      "assertions": []
    },
    {
      "stepId": "3",
      "originalText": "Click Submit and verify that the successful-login page is displayed.",
      "actions": [
        {
          "type": "click",
          "target": {
            "description": "Submit button",
            "accessibleName": "Submit",
            "role": "button"
          }
        }
      ],
      "expectedResult": "The authenticated Dashboard page is displayed.",
      "assertions": [
        {
          "type": "visible",
          "target": {
            "description": "Dashboard heading on the authenticated page",
            "accessibleName": "Dashboard",
            "role": "heading"
          }
        }
      ]
    }
  ]
}
