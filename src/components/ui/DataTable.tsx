import React from "react";

export type DataColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

interface Props<T> {
  columns: Array<DataColumn<T>>;
  data: T[];
}

export function DataTable<T extends Record<string, unknown>>({ columns, data }: Props<T>) {
  return (
    <table className="shell-table" role="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)} scope="col">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={String(col.key)}>{col.render ? col.render(row) : (row as any)[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;
