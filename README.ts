results = allRecords
            .Where(r => r.emailaddress != null)
            .Select(g => new myModel
            {                            
                RowCount = g.Count(),                
                myTypes = string.Join(", ", g.Select(r => r.mytype).Distinct()),
                Status = string.Join(", ", g.Select(r => r.status).Distinct()),                
            .Select(id => $"<div class='py-1 border-bottom'>{id}</div>"))
            })
            .Take(5)
            .ToList();
return results;
