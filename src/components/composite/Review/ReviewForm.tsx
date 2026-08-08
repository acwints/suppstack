'use client';

import { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import type { ReviewInput } from '@/types';
import { USAGE_DURATION_OPTIONS } from '@/types';
import { Button, Input, Select } from '@/components/ui';
import { RatingInput } from '@/components/composite/Rating';

export interface ReviewFormProps {
  productId: string;
  productName: string;
  initialData?: Partial<ReviewInput>;
  onSubmit: (review: ReviewInput) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function ReviewForm({
  productId,
  productName,
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [overallRating, setOverallRating] = useState(initialData?.overall_rating || 0);
  const [effectivenessRating, setEffectivenessRating] = useState(initialData?.effectiveness_rating || 0);
  const [valueRating, setValueRating] = useState(initialData?.value_rating || 0);
  const [qualityRating, setQualityRating] = useState(initialData?.quality_rating || 0);
  const [reviewTitle, setReviewTitle] = useState(initialData?.review_title || '');
  const [reviewBody, setReviewBody] = useState(initialData?.review_body || '');
  const [pros, setPros] = useState<string[]>(initialData?.pros || []);
  const [cons, setCons] = useState<string[]>(initialData?.cons || []);
  const [usageDuration, setUsageDuration] = useState(initialData?.usage_duration || '');
  const [wouldRecommend, setWouldRecommend] = useState(initialData?.would_recommend ?? true);

  // Pro/con input state
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const addPro = () => {
    if (newPro.trim() && pros.length < 5) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const addCon = () => {
    if (newCon.trim() && cons.length < 5) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (overallRating === 0) {
      setError('Please select an overall rating');
      return;
    }
    if (!reviewBody.trim()) {
      setError('Please write a review');
      return;
    }
    if (reviewBody.trim().length < 20) {
      setError('Review must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        product_id: productId,
        overall_rating: overallRating,
        effectiveness_rating: effectivenessRating || undefined,
        value_rating: valueRating || undefined,
        quality_rating: qualityRating || undefined,
        review_title: reviewTitle.trim() || undefined,
        review_body: reviewBody.trim(),
        pros: pros.length > 0 ? pros : undefined,
        cons: cons.length > 0 ? cons : undefined,
        usage_duration: usageDuration as ReviewInput['usage_duration'] || undefined,
        would_recommend: wouldRecommend,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {isEdit ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        <p className="text-sm text-gray-500">
          Share your experience with {productName}
        </p>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Overall Rating */}
      <RatingInput
        value={overallRating}
        onChange={setOverallRating}
        label="Overall Rating"
        required
      />

      {/* Additional Ratings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effectiveness
          </label>
          <RatingInput
            value={effectivenessRating}
            onChange={setEffectivenessRating}
            size="md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value
          </label>
          <RatingInput
            value={valueRating}
            onChange={setValueRating}
            size="md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality
          </label>
          <RatingInput
            value={qualityRating}
            onChange={setQualityRating}
            size="md"
          />
        </div>
      </div>

      {/* Review Title */}
      <Input
        label="Review Title (optional)"
        value={reviewTitle}
        onChange={(e) => setReviewTitle(e.target.value)}
        placeholder="Summarize your experience"
        maxLength={200}
      />

      {/* Review Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Review <span className="text-error-500">*</span>
        </label>
        <textarea
          value={reviewBody}
          onChange={(e) => setReviewBody(e.target.value)}
          placeholder="Share your experience with this product. What did you like or dislike? How has it helped you?"
          rows={5}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base transition-[border-color,box-shadow] duration-150 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:text-sm"
          minLength={20}
        />
        <p className="text-xs text-gray-500 mt-1">
          {reviewBody.length}/20 minimum characters
        </p>
      </div>

      {/* Pros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pros (optional)
        </label>
        <div className="space-y-2">
          {pros.map((pro, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-gray-900">+</span>
              <span className="flex-1 text-sm">{pro}</span>
              <button
                type="button"
                onClick={() => removePro(index)}
                className="text-gray-400 hover:text-error-500"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
          {pros.length < 5 && (
            <div className="flex gap-2">
              <Input
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="Add a pro..."
                inputSize="sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addPro}>
                <FaPlus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cons (optional)
        </label>
        <div className="space-y-2">
          {cons.map((con, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-gray-400">-</span>
              <span className="flex-1 text-sm">{con}</span>
              <button
                type="button"
                onClick={() => removeCon(index)}
                className="text-gray-400 hover:text-error-500"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
          {cons.length < 5 && (
            <div className="flex gap-2">
              <Input
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="Add a con..."
                inputSize="sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addCon}>
                <FaPlus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Usage Duration */}
      <Select
        label="How long have you used this product?"
        options={USAGE_DURATION_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
        value={usageDuration}
        onChange={(e) => setUsageDuration(e.target.value)}
        placeholder="Select duration"
      />

      {/* Would Recommend */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Would you recommend this product?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={wouldRecommend === true}
              onChange={() => setWouldRecommend(true)}
              className="w-4 h-4 text-gray-900"
            />
            <span className="text-sm">Yes, I would recommend</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={wouldRecommend === false}
              onChange={() => setWouldRecommend(false)}
              className="w-4 h-4 text-gray-900"
            />
            <span className="text-sm">No, I would not recommend</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isEdit ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}

export default ReviewForm;
