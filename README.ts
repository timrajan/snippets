  var payload = new
  {
      definition = new
      {
          id = _pipelineId
      },
      sourceBranch = _branch,
      parameters = (new
      {
          // Map form fields  pipeline parameters
          param1 = param1value,
          param2 = param2value,
      }
      )
  };
