'use client';

import { useState, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';
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
  const [status, setStatus] = useState<SupplementStatus>('active');

  // Initialize form from existing settings
  useEffect(() => {
    if (existingSettings) {
      setCustomDosage(existingSettings.custom_dosage || '');
      setServingsPerDay(existingSettings.servings_per_day || 1);
      setScheduleDays(existingSettings.schedule_days || [1, 2, 3, 4, 5, 6, 7]);
      setStatus(existingSettings.status || 'active');
    } else {
      // Reset to defaults
      setCustomDosage('');
      setServingsPerDay(1);
      setScheduleDays([1, 2, 3, 4, 5, 6, 7]);
      setStatus('active');
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
        status,
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
                    ? 'bg-gray-900 text-white'
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
                    ? 'bg-accent-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.short.charAt(0)}
              </button>
            ))}
          </div>
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
