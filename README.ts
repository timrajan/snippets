rows.forEach(row => {
  if (row['Date']) row['Date'] = usToAu(row['Date']);
});

function usToAu(s: string): string {
  const [m, d, y] = s.split('/');
  return `${d}/${m}/${y}`;
}


const workbook = XLSX.readFile('file.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<any>(sheet, { raw: false, dateNF: 'dd/mm/yyyy' });

// fix the date column immediately, once, for all rows:
rows.forEach(row => {
  if (row['Date']) row['Date'] = usToAu(row['Date']);
});

