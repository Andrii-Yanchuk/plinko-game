export function getRowsProgress(rows: number, minRows: number, maxRows: number) {
  return ((rows - minRows) / (maxRows - minRows)) * 100;
}
