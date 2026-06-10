interface ExcelOptions {
  filename: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

function escapeCsvValue(value: string | number) {
  const stringValue = String(value ?? "");
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportTableToExcel({ filename, headers, rows }: ExcelOptions) {
  const headerRow = headers.map((header) => escapeCsvValue(header)).join(";");
  const bodyRows = rows
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(";"))
    .join("\r\n");

  const csvContent = `${headerRow}\r\n${bodyRows}`;
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
