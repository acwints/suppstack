'use client';

import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type Row = { name: string; days: boolean[] };

function emptyRow(): Row {
  return { name: '', days: [true, true, true, true, true, true, true] };
}

/** A weekday planner. It does not set a clock time or a dose. */
export function SchedulePlanner() {
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);

  const updateName = (index: number, name: string) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, name } : row)));
  };

  const toggleDay = (index: number, day: number) => {
    setRows((current) =>
      current.map((row, i) =>
        i === index
          ? { ...row, days: row.days.map((on, d) => (d === day ? !on : on)) }
          : row
      )
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-600">
        Mark the days you intend to take each product. This planner does not choose a dose or a
        time of day.
      </p>
      <div className="mt-4 space-y-4">
        {rows.map((row, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-900" htmlFor={`plan-name-${index}`}>
              Product {index + 1}
            </label>
            <input
              id={`plan-name-${index}`}
              value={row.name}
              onChange={(event) => updateName(index, event.target.value)}
              placeholder="Product name"
              className="mt-1 min-h-11 w-full rounded border border-gray-300 px-3 text-base text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DAYS.map((day, dayIndex) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={row.days[dayIndex]}
                  onClick={() => toggleDay(index, dayIndex)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded border px-2 text-xs font-medium ${
                    row.days[dayIndex]
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((current) => (current.length >= 6 ? current : [...current, emptyRow()]))}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-gray-700 underline underline-offset-2"
      >
        Add another product
      </button>
    </div>
  );
}
