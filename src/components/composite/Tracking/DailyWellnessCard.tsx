'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiHeart, FiEdit2, FiCheck } from 'react-icons/fi';
import { Card, Button } from '@/components/ui';
import type { DailyTrackingSummary, DailyWellnessInput } from '@/types';

export interface DailyWellnessCardProps {
  dailySummary: DailyTrackingSummary | null;
  onSave: (data: DailyWellnessInput) => Promise<void>;
  isLoading?: boolean;
}

const moodOptions = [
  { value: 1, emoji: '😫', label: 'Terrible', shortLabel: 'Bad' },
  { value: 2, emoji: '😔', label: 'Bad', shortLabel: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay', shortLabel: 'OK' },
  { value: 4, emoji: '🙂', label: 'Good', shortLabel: 'Good' },
  { value: 5, emoji: '😄', label: 'Great', shortLabel: 'Great' },
];

const energyOptions = [
  { value: 1, emoji: '🪫', label: 'Exhausted', shortLabel: 'Low' },
  { value: 2, emoji: '😴', label: 'Tired', shortLabel: 'Tired' },
  { value: 3, emoji: '⚡', label: 'Normal', shortLabel: 'OK' },
  { value: 4, emoji: '💪', label: 'Energized', shortLabel: 'High' },
  { value: 5, emoji: '🚀', label: 'Supercharged', shortLabel: 'Max' },
];

const sleepOptions = [
  { value: 1, label: 'Terrible' },
  { value: 2, label: 'Poor' },
  { value: 3, label: 'Fair' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
];

export function DailyWellnessCard({
  dailySummary,
  onSave,
  isLoading = false,
}: DailyWellnessCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [mood, setMood] = useState<number>(dailySummary?.overall_mood || 0);
  const [energy, setEnergy] = useState<number>(dailySummary?.overall_energy || 0);
  const [sleepQuality, setSleepQuality] = useState<number>(dailySummary?.sleep_quality || 0);
  const [sleepHours, setSleepHours] = useState<string>(dailySummary?.sleep_hours?.toString() || '');
  const [notes, setNotes] = useState(dailySummary?.daily_notes || '');

  // Update form when summary changes
  useEffect(() => {
    if (dailySummary) {
      setMood(dailySummary.overall_mood || 0);
      setEnergy(dailySummary.overall_energy || 0);
      setSleepQuality(dailySummary.sleep_quality || 0);
      setSleepHours(dailySummary.sleep_hours?.toString() || '');
      setNotes(dailySummary.daily_notes || '');
    }
  }, [dailySummary]);

  const hasData = mood > 0 || energy > 0 || sleepQuality > 0 || sleepHours;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        overall_mood: mood || undefined,
        overall_energy: energy || undefined,
        sleep_quality: sleepQuality || undefined,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : undefined,
        daily_notes: notes || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving wellness data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick view mode (non-editing)
  if (!isEditing && hasData) {
    return (
      <Card variant="modern" className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Today&apos;s Wellness</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
          >
            <FiEdit2 size={18} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {mood > 0 && (
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
              <div className="text-xl sm:text-2xl mb-1">{moodOptions[mood - 1]?.emoji}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">Mood</div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                <span className="sm:hidden">{moodOptions[mood - 1]?.shortLabel}</span>
                <span className="hidden sm:inline">{moodOptions[mood - 1]?.label}</span>
              </div>
            </div>
          )}
          {energy > 0 && (
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
              <div className="text-xl sm:text-2xl mb-1">{energyOptions[energy - 1]?.emoji}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">Energy</div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                <span className="sm:hidden">{energyOptions[energy - 1]?.shortLabel}</span>
                <span className="hidden sm:inline">{energyOptions[energy - 1]?.label}</span>
              </div>
            </div>
          )}
          {(sleepQuality > 0 || sleepHours) && (
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
              <div className="text-xl sm:text-2xl mb-1">😴</div>
              <div className="text-[10px] sm:text-xs text-gray-500">Sleep</div>
              <div className="text-xs sm:text-sm font-medium text-gray-700">
                {sleepHours ? `${sleepHours}h` : sleepOptions[sleepQuality - 1]?.label}
              </div>
            </div>
          )}
        </div>

        {notes && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{notes}</p>
          </div>
        )}
      </Card>
    );
  }

  // Edit/Empty mode
  return (
    <Card variant="modern" className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
          {hasData ? 'Edit Wellness Check-in' : "How are you feeling today?"}
        </h3>
        {isEditing && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-900 py-1 px-2 -mr-2 touch-manipulation"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Mood Selection */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
          <FiHeart className="text-pink-500" />
          Mood
        </label>
        <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide snap-x snap-mandatory sm:overflow-visible sm:grid sm:grid-cols-5">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`flex-shrink-0 w-[72px] sm:w-auto sm:flex-1 p-3 sm:p-3 rounded-xl text-center transition-all touch-manipulation snap-start active:scale-95 ${
                  mood === option.value
                    ? 'bg-pink-100 ring-2 ring-pink-500'
                    : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                <div className="text-2xl sm:text-2xl mb-1">{option.emoji}</div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  <span className="sm:hidden">{option.shortLabel}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Energy Selection */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
          <FiSun className="text-yellow-500" />
          Energy Level
        </label>
        <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide snap-x snap-mandatory sm:overflow-visible sm:grid sm:grid-cols-5">
            {energyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setEnergy(option.value)}
                className={`flex-shrink-0 w-[72px] sm:w-auto sm:flex-1 p-3 sm:p-3 rounded-xl text-center transition-all touch-manipulation snap-start active:scale-95 ${
                  energy === option.value
                    ? 'bg-yellow-100 ring-2 ring-yellow-500'
                    : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                <div className="text-2xl sm:text-2xl mb-1">{option.emoji}</div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  <span className="sm:hidden">{option.shortLabel}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sleep */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
          <FiMoon className="text-indigo-500" />
          Sleep
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hours slept</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="7.5"
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-base sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sleep quality</label>
            <select
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-base sm:text-sm bg-white"
            >
              <option value={0}>Select...</option>
              {sleepOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-5 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling? Anything notable about today?"
          rows={2}
          className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none text-base sm:text-sm"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        variant="primary"
        fullWidth
        size="lg"
        isLoading={isSaving}
        leftIcon={<FiCheck size={16} />}
      >
        Save Check-in
      </Button>
    </Card>
  );
}

export default DailyWellnessCard;
