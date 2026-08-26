 private List<MyModel> PendingQuery()
 {            
     var cutoff = DateTime.Now.AddHours(-1);

     var allRecords = _stgcontext.testdata
                            .AsNoTracking()
                            .Where(x => x.status.ToLower() != "active" && x.created_at >= cutoff)
                            .ToList();
