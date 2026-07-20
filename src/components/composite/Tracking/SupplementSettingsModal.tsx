'use client';

import { useState, useEffect } from 'react';
import { FiTarget, FiCalendar } from 'react-icons/fi';
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
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [takeWithFood, setTakeWithFood] = useState(false);
  const [status, setStatus] = useState<SupplementStatus>('active');
  const [goal, setGoal] = useState('');
  const [targetDuration, setTargetDuration] = useState<number | ''>('');

  // Initialize form from existing settings
  useEffect(() => {
    if (existingSettings) {
      setCustomDosage(existingSettings.custom_dosage || '');
      setServingsPerDay(existingSettings.servings_per_day || 1);
      setScheduleDays(existingSettings.schedule_days || [1, 2, 3, 4, 5, 6, 7]);
      setTakeWithFood(existingSettings.take_with_food || false);
      setStatus(existingSettings.status || 'active');
      setGoal(existingSettings.goal || '');
      setTargetDuration(existingSettings.target_duration_days || '');
    } else {
      // Reset to defaults
      setCustomDosage('');
      setServingsPerDay(1);
      setScheduleDays([1, 2, 3, 4, 5, 6, 7]);
      setTakeWithFood(false);
      setStatus('active');
      setGoal('');
      setTargetDuration('');
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
        schedule_days: scheduleDays,
        take_with_food: takeWithFood,
        status,
        goal: goal || undefined,
        target_duration_days: targetDuration ? Number(targetDuration) : undefined,
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
