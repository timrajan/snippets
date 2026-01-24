                                                                                                                                                                                                     
  -- Delete in order due to foreign keys                                                                                                                                                                         
  TRUNCATE TABLE test_artifacts CASCADE;                                                                                                                                                                         
  TRUNCATE TABLE test_step_results CASCADE;                                                                                                                                                                      
  TRUNCATE TABLE test_case_results CASCADE;                                                                                                                                                                      
  TRUNCATE TABLE suite_runs CASCADE;        
