'use client';

import { useMemo, useState } from 'react';

const ISSN_TIMING =
  'https://jissn.biomedcentral.com/articles/10.1186/s12970-021-00412-w';

function formatClock(value: string): string {
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/**
 * Plans a clock time around a workout. It does not calculate a dose.
 */
export function CreatineTimingCalculator() {
  const [workoutTime, setWorkoutTime] = useState('07:00');
  const [placement, setPlacement] = useState<'with-workout' | 'same-time-daily'>('same-time-daily');

  const clock = useMemo(() => formatClock(workoutTime), [workoutTime]);
  const suggested = placement === 'with-workout' ? clock : clock;

  return (
    <form
      className="rounded-lg border border-gray-200 bg-white p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <p className="rounded-lg border border-gray-900 bg-gray-50 p-4 text-sm font-medium text-gray-900">
        Not medical advice. This planner only picks a clock time. It does not recommend a dose.
        Ask your doctor or pharmacist before you start creatine.
      </p>

      <div className="mt-4">
        <label htmlFor="workout-time" className="block text-sm font-medium text-gray-900">
          What time do you usually train?
        </label>
        <input
          id="workout-time"
          type="time"
          value={workoutTime}
          onChange={(event) => setWorkoutTime(event.target.value)}
          required
          className="mt-2 min-h-11 rounded border border-gray-300 px-3 text-base text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-gray-900">Where should that time sit?</legend>
        <div className="mt-2 space-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="placement"
              checked={placement === 'same-time-daily'}
              onChange={() => setPlacement('same-time-daily')}
            />
            Same time each day you take it
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="placement"
              checked={placement === 'with-workout'}
              onChange={() => setPlacement('with-workout')}
            />
            At the workout time you entered
          </label>
        </div>
      </fieldset>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Informational plan</p>
        <p className="mt-2 text-lg text-gray-900">{suggested}</p>
        <p className="mt-2 text-sm text-gray-600">
          {placement === 'with-workout'
            ? `One planning option is ${clock}, the time you entered for training. That is your clock time, not a finding that this minute works better than another.`
            : `Use ${clock} only if that is a time you will actually repeat. Any other repeated time is the same kind of plan.`}
        </p>
        <p className="mt-3 text-sm text-gray-600">
          A 2021 International Society of Sports Nutrition review describes the evidence on taking
          creatine before versus after exercise as limited and mixed, and describes daily intake as
          mattering more than precise timing.{' '}
          <a
            href={ISSN_TIMING}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Antonio et al., JISSN, 2021
          </a>
          . There is no data on this page that a specific offset, such as 30 minutes before
          training, is required.
        </p>
      </div>
    </form>
  );
}
