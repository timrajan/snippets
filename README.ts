var itemParams = workitem.Fields["Microsoft.VSTS.TCM.Parameters"];
    var itemParamsElement = XElement.Parse((string)itemParams);

    var paramDataSource = workitem.Fields["Microsoft.VSTS.TCM.LocalDataSource"];
    var xElement = XElement.Parse(paramDataSource.ToString());

    //Assuming we have a table named "Table1" in the workitem
    descendants = xElement.Descendants("Table1");

    foreach (var xe in itemParamsElement.Descendants("param"))
    {
      var name = xe.Attribute("name").Value;
      dt.Columns.Add(name, typeof(string));
    }
