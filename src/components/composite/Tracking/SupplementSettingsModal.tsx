'use client';

import { useState, useEffect } from 'react';
import { FiX, FiClock, FiTarget, FiCalendar, FiBell } from 'react-icons/fi';
import { Modal, Button, Input } from '@/components/ui';
import type { UserSupplementSettings, UserSupplementSettingsInput, SupplementStatus } from '@/types';
import { SUPPLEMENT_STATUS_OPTIONS, DAYS_OF_WEEK } from '@/types';

export interface SupplementSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  existingSettings?: UserSupplementSettings;
  onSave: (settings: UserSupplementSettingsInput) => Promise<void>;
}

export function SupplementSettingsModal({
  isOpen,
  onClose,
  productId,
  productName,
  existingSettings,
  onSave,
}: SupplementSettingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [customDosage, setCustomDosage] = useState('');
  const [servingsPerDay, setServingsPerDay] = useState(1);
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00']);
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [takeWithFood, setTakeWithFood] = useState(false);
  const [timingNotes, setTimingNotes] = useState('');
  const [status, setStatus] = useState<SupplementStatus>('active');
  const [goal, setGoal] = useState('');
  const [targetDuration, setTargetDuration] = useState<number | ''>('');
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  // Initialize form from existing settings
  useEffect(() => {
    if (existingSettings) {
      setCustomDosage(existingSettings.custom_dosage || '');
      setServingsPerDay(existingSettings.servings_per_day || 1);
      setScheduleTimes(existingSettings.schedule_times || ['08:00']);
      setScheduleDays(existingSettings.schedule_days || [1, 2, 3, 4, 5, 6, 7]);
      setTakeWithFood(existingSettings.take_with_food || false);
      setTimingNotes(existingSettings.timing_notes || '');
      setStatus(existingSettings.status || 'active');
      setGoal(existingSettings.goal || '');
      setTargetDuration(existingSettings.target_duration_days || '');
      setRemindersEnabled(existingSettings.reminders_enabled || false);
    } else {
      // Reset to defaults
      setCustomDosage('');
      setServingsPerDay(1);
      setScheduleTimes(['08:00']);
      setScheduleDays([1, 2, 3, 4, 5, 6, 7]);
      setTakeWithFood(false);
      setTimingNotes('');
      setStatus('active');
      setGoal('');
      setTargetDuration('');
      setRemindersEnabled(false);
    }
  }, [existingSettings, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        product_id: productId,
        custom_dosage: customDosage || undefined,
        servings_per_day: servingsPerDay,
        schedule_times: scheduleTimes,
        schedule_days: scheduleDays,
        take_with_food: takeWithFood,
        timing_notes: timingNotes || undefined,
        status,
        goal: goal || undefined,
        target_duration_days: targetDuration ? Number(targetDuration) : undefined,
        reminders_enabled: remindersEnabled,
      });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setScheduleDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const addTime = () => {
    setScheduleTimes(prev => [...prev, '12:00']);
  };

  const removeTime = (index: number) => {
    setScheduleTimes(prev => prev.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, value: string) => {
    setScheduleTimes(prev => prev.map((t, i) => i === index ? value : t));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Settings: ${productName}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex gap-2">
            {SUPPLEMENT_STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  status === option.value
                    ? option.value === 'active'
                      ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                      : option.value === 'paused'
                      ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500'
                      : 'bg-gray-200 text-gray-700 ring-2 ring-gray-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dosage */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Custom Dosage"
            value={customDosage}
            onChange={(e) => setCustomDosage(e.target.value)}
            placeholder="e.g., 500mg, 2 capsules"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servings Per Day
            </label>
            <input
              type="number"
              min={0.5}
              max={10}
              step={0.5}
              value={servingsPerDay}
              onChange={(e) => setServingsPerDay(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
        </div>

        {/* Schedule Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiCalendar className="inline mr-1" />
            Schedule Days
          </label>
          <div className="flex gap-2">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  scheduleDays.includes(day.value)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.short.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Times */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiClock className="inline mr-1" />
            Schedule Times
          </label>
          <div className="space-y-2">
            {scheduleTimes.map((time, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
                {scheduleTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTime(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            ))}
            {scheduleTimes.length < 4 && (
              <button
                type="button"
                onClick={addTime}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                + Add another time
              </button>
            )}
          </div>
        </div>

        {/* Reminders Toggle */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${remindersEnabled ? 'bg-orange-100' : 'bg-gray-200'}`}>
                <FiBell className={`w-5 h-5 ${remindersEnabled ? 'text-orange-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <label htmlFor="remindersEnabled" className="font-medium text-gray-900 cursor-pointer">
                  Reminder schedule
                </label>
                <p className="text-sm text-gray-500">Save the times you plan to take this</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={remindersEnabled}
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                remindersEnabled ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {remindersEnabled && (
            <p className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Scheduled for {scheduleTimes.join(', ')}. Push reminders are coming soon — for now
              your schedule appears on your daily log.
            </p>
          )}
        </div>

        {/* Take with food */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="takeWithFood"
            checked={takeWithFood}
            onChange={(e) => setTakeWithFood(e.target.checked)}
            className="w-4 h-4 text-gray-900 rounded focus:ring-gray-900"
          />
          <label htmlFor="takeWithFood" className="text-sm text-gray-700">
            Take with food
          </label>
        </div>

        {/* Timing Notes */}
        <Input
          label="Timing Notes"
          value={timingNotes}
          onChange={(e) => setTimingNotes(e.target.value)}
          placeholder="e.g., Take 30 min before breakfast"
        />

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FiTarget className="inline mr-1" />
            Goal (optional)
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Build muscle, support focus..."
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
          />
        </div>

        {/* Target Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Duration (days)
          </label>
          <input
            type="number"
            min={1}
            value={targetDuration}
            onChange={(e) => setTargetDuration(e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g., 30, 60, 90"
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SupplementSettingsModal;
