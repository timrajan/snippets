 TemplateParameters = parameters.ToDictionary(p => p.Key, p => (object)p.Value)  // AND this


var templateParameters = new Dictionary<string, object>();
        foreach (var param in parameters)
        {
            templateParameters.Add(param.Key, param.Value);
        }
