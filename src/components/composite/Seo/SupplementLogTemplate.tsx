'use client';

import { useState } from 'react';

type LogRow = { date: string; product: string; servings: string; taken: boolean };

function blankRow(): LogRow {
  return { date: '', product: '', servings: '', taken: false };
}

function asText(rows: LogRow[]): string {
  const header = ['Date', 'Product', 'Servings you planned', 'Checked off'].join('\t');
  const body = rows
    .map((row) => [row.date, row.product, row.servings, row.taken ? 'yes' : ''].join('\t'))
    .join('\n');
  return `${header}\n${body}\n`;
}

/** A blank log you can fill, copy, or print. It is not a dose chart. */
export function SupplementLogTemplate() {
  const [rows, setRows] = useState<LogRow[]>(() => Array.from({ length: 7 }, blankRow));
  const [copied, setCopied] = useState(false);

  const update = (index: number, patch: Partial<LogRow>) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setCopied(false);
  };

  const copy = () => {
    void navigator.clipboard.writeText(asText(rows)).then(() => setCopied(true)).catch(() => setCopied(false));
  };

  const printLog = () => {
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) return;
    popup.document.title = 'Supplement log';
    const pre = popup.document.createElement('pre');
    pre.textContent = asText(rows);
    popup.document.body.appendChild(pre);
    popup.print();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-600">
        Fill a week, then copy or print it. Servings here means what you already planned to take,
        not a dose this page recommends.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-2 font-medium">Date</th>
              <th className="py-2 pr-2 font-medium">Product</th>
              <th className="py-2 pr-2 font-medium">Servings you planned</th>
              <th className="py-2 font-medium">Checked off</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 pr-2">
                  <input
                    type="date"
                    aria-label={`Date for row ${index + 1}`}
                    value={row.date}
                    onChange={(event) => update(index, { date: event.target.value })}
                    className="min-h-11 w-full rounded border border-gray-300 px-2"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    aria-label={`Product for row ${index + 1}`}
                    value={row.product}
                    onChange={(event) => update(index, { product: event.target.value })}
                    className="min-h-11 w-full rounded border border-gray-300 px-2"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    aria-label={`Planned servings for row ${index + 1}`}
                    value={row.servings}
                    onChange={(event) => update(index, { servings: event.target.value })}
                    className="min-h-11 w-full rounded border border-gray-300 px-2"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="checkbox"
                    aria-label={`Checked off for row ${index + 1}`}
                    checked={row.taken}
                    onChange={(event) => update(index, { taken: event.target.checked })}
                    className="h-5 w-5"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 items-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
        >
          {copied ? 'Copied' : 'Copy log'}
        </button>
        <button
          type="button"
          onClick={printLog}
          className="inline-flex min-h-11 items-center rounded border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          Print log
        </button>
      </div>
    </div>
  );
}
