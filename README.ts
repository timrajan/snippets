const DATE_RE = /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/;

function normalizeDate(input: string): string {
  const match = input.trim().match(DATE_RE);
  if (!match) return input;                // doesn't match the format → return as-is

  const dd = match[1].padStart(2, "0");
  const mm = match[2].padStart(2, "0");
  const year = match[3];
  return `${dd}/${mm}/${year}`;            // matches → normalised to DD/MM/YYYY
}
