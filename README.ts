
 Upload thumbnail:                                                                                                                                                                                            
  curl -X POST "http://192.168.0.46:8000/api/v1/test-recordings/{recording_id}/screenshots" \                                                                                                                  
    -H "Authorization: Bearer {token}" \                                                                                                                                                                       
    -F "file=@thumbnail.png" \                                                                                                                                                                                 
    -F "step_number=0"                                                                                                                                                                                         
                                                                                                                                                                                                               
  Download thumbnail:                                                                                                                                                                                          
  curl -X GET "http://192.168.0.46:8000/api/v1/test-recordings/{recording_id}/screenshots/0" \                                                                                                                 
    -H "Authorization: Bearer {token}" \                                                                                                                                                                       
    --output thumbnail.png                                                                                                                                                                                     
                                                                                                                                                                                                               
  The thumbnail is stored as a screenshot with step_number=0. Regular screenshots start from step_number=1.                                                                                                    
                                                                                                                                                                                                               
  Summary of endpoints:                                                                                                                                                                                        
  ┌──────────────────────────┬────────┬─────────────────────────────────────────────────────────────────────────┐                                                                                              
  │        Operation         │ Method │                                Endpoint                                 │                                                                                              
  ├──────────────────────────┼────────┼─────────────────────────────────────────────────────────────────────────┤                                                                                              
  │ Upload thumbnail         │ POST   │ /test-recordings/{recording_id}/screenshots (with step_number=0)        │                                                                                              
  ├──────────────────────────┼────────┼─────────────────────────────────────────────────────────────────────────┤                                                                                              
  │ Download thumbnail       │ GET    │ /test-recordings/{recording_id}/screenshots/0                           │                                                                                              
  ├──────────────────────────┼────────┼─────────────────────────────────────────────────────────────────────────┤                                                                                              
  │ Upload step screenshot   │ POST   │ /test-recordings/{recording_id}/screenshots (with step_number=1,2,3...) │                                                                                              
  ├──────────────────────────┼────────┼─────────────────────────────────────────────────────────────────────────┤                                                                                              
  │ Download step screenshot │ GET    │ /test-recordings/{recording_id}/screenshots/{step_number}               │                                                                                              
  └──────────────────────────┴────────┴─────────────────────────────────────────────────────────────────────────┘                                                                                              
  The code I added will:                                                                                                                                                                                       
  1. Try to download thumbnail (step 0) from server                                                                                                                                                            
  2. If not available, fall back to using the first screenshot (step 1) as thumbnail                                                                                                                           
  3. Cache locally in .cache/recordings/{test_case_id}/{recording_id}/thumbnail.png     
