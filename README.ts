import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('file.xlsx', { cellDates: true });
// or for buffers:
const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
