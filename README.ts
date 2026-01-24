Here's a message for the team:                                                                                                                                                                                                                               

  ---                                                                                                                                                                                                                                                            Issue: GET /api/v1/reports/suite-runs returns 0 results despite successful creation
                                                                                                                                                                                                                                                               
  What's happening:
  - POST /api/v1/reports/suite-runs successfully creates a suite run (201) with ID 4f61b0fc-7e4d-468a-8692-8a5e99832da2
  - GET /api/v1/reports/suite-runs returns 0 results

  Root cause identified:
  The suite run was created with user_id = 9e584a24-0151-4abe-aa47-9c790c25514b, but the GET request appears to be authenticating as a different user.

  The API filters suite runs by the authenticated user's ID, so if the tokens don't match the same user, the results will be empty.

  Action needed:
  1. What user_id is the GET request authenticating as? (Decode the JWT or check logs)
  2. Why are the POST and GET requests using different auth tokens/users?
  3. Is there a token refresh happening that's switching users, or are multiple accounts configured?
