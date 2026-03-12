if (long.TryParse(filterValue, out long accNumber))
{
    results = allRecords.Where(r => r.accnumber != null && r.accnumber == accNumber).ToList();
}
