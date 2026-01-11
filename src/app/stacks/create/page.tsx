'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiPlus,
  FiX,
  FiSearch,
  FiGlobe,
  FiLock,
  FiYoutube,
  FiMic,
  FiFileText,
  FiLink,
  FiStar,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { useStacks, useSupplements, useDebounce } from '@/hooks';
import { Button, Input, Badge, Spinner, Card, Stack, Inline, Grid } from '@/components/ui';
import type { StackSupplementInput, Stack as StackType } from '@/types';

interface SupplementEntry extends StackSupplementInput {
  supplement_name: string;
}

const sourceTypes: { value: StackType['source_type']; label: string; icon: JSX.Element }[] = [
  { value: 'youtube', label: 'YouTube', icon: <FiYoutube /> },
  { value: 'podcast', label: 'Podcast', icon: <FiMic /> },
  { value: 'article', label: 'Article', icon: <FiFileText /> },
  { value: 'interview', label: 'Interview', icon: <FiMic /> },
  { value: 'website', label: 'Website', icon: <FiGlobe /> },
];

export default function CreateStackPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createStack } = useStacks({ enabled: false });

  // Form state
  const [stackName, setStackName] = useState('');
  const [stackDescription, setStackDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [supplements, setSupplements] = useState<SupplementEntry[]>([]);

  // Source state
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<StackType['source_type'] | ''>('');
  const [sourceDate, setSourceDate] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSupplementPicker, setShowSupplementPicker] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { filteredSupplements, isLoading: supplementsLoading } = useSupplements({
    searchTerm: debouncedSearch,
  });

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  const addSupplement = (supplement: { supplement_id: number; supplement_name: string }) => {
    if (supplements.some((s) => s.supplement_id === supplement.supplement_id)) {
      return;
    }

    setSupplements([
      ...supplements,
      {
        supplement_id: supplement.supplement_id,
        supplement_name: supplement.supplement_name,
        dosage: '',
        frequency: '',
        timing: '',
        notes: '',
        is_core: true,
        order_index: supplements.length,
      },
    ]);
    setSearchTerm('');
    setShowSupplementPicker(false);
  };

  const removeSupplement = (supplementId: number) => {
    setSupplements(
      supplements
        .filter((s) => s.supplement_id !== supplementId)
        .map((s, idx) => ({ ...s, order_index: idx }))
    );
  };

  const updateSupplement = (supplementId: number, field: keyof SupplementEntry, value: any) => {
    setSupplements(
      supplements.map((s) => (s.supplement_id === supplementId ? { ...s, [field]: value } : s))
    );
  };

  const moveSupplement = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= supplements.length) return;

    const newSupplements = [...supplements];
    [newSupplements[index], newSupplements[newIndex]] = [
      newSupplements[newIndex],
      newSupplements[index],
    ];
    setSupplements(newSupplements.map((s, idx) => ({ ...s, order_index: idx })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stackName.trim()) {
      setError('Stack name is required');
      return;
    }

    if (supplements.length === 0) {
      setError('Add at least one supplement to your stack');
      return;
    }

    setIsSubmitting(true);

    try {
      const stack = await createStack({
        stack_name: stackName.trim(),
        stack_description: stackDescription.trim(),
        is_public: isPublic,
        source_title: sourceTitle.trim() || undefined,
        source_url: sourceUrl.trim() || undefined,
        source_type: sourceType || undefined,
        source_date: sourceDate || undefined,
        supplements: supplements.map(({ supplement_name, ...rest }) => rest),
      });

      router.push(`/stacks/${stack.stack_id}`);
    } catch (err) {
      console.error('Failed to create stack:', err);
      setError('Failed to create stack. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSupplements = filteredSupplements.filter(
    (s) => !supplements.some((existing) => existing.supplement_id === s.supplement_id)
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/stacks"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <FiArrowLeft />
        <span>Back to Stacks</span>
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Create a Stack</h1>

      <form onSubmit={handleSubmit}>
        <Stack gap={8}>
          {/* Basic Info */}
          <Card padding="lg">
            <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>

            <Stack gap={4}>
              <Input
                label="Stack Name *"
                value={stackName}
                onChange={(e) => setStackName(e.target.value)}
                placeholder="e.g., Morning Energy Stack"
                maxLength={100}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={stackDescription}
                  onChange={(e) => setStackDescription(e.target.value)}
                  placeholder="Describe what this stack is for and who it's best suited for..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <Inline gap={3}>
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      isPublic
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiGlobe />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      !isPublic
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiLock />
                    <span>Private</span>
                  </button>
                </Inline>
                <p className="text-xs text-gray-500 mt-1">
                  {isPublic ? 'Anyone can view and copy this stack' : 'Only you can see this stack'}
                </p>
              </div>
            </Stack>
          </Card>

          {/* Supplements */}
          <Card padding="lg">
            <Inline justify="between" align="center" className="mb-4">
              <h2 className="font-semibold text-gray-900">Supplements</h2>
              <Badge variant="secondary">{supplements.length} added</Badge>
            </Inline>

            {/* Added Supplements */}
            {supplements.length > 0 && (
              <Stack gap={3} className="mb-4">
                {supplements.map((supplement, index) => (
                  <div
                    key={supplement.supplement_id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    <Inline justify="between" align="start" className="mb-3">
                      <Inline gap={3} align="center">
                        <Stack gap={1}>
                          <button
                            type="button"
                            onClick={() => moveSupplement(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <FiChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSupplement(index, 'down')}
                            disabled={index === supplements.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <FiChevronDown size={14} />
                          </button>
                        </Stack>
                        <div>
                          <h4 className="font-medium text-gray-900">{supplement.supplement_name}</h4>
                          <button
                            type="button"
                            onClick={() =>
                              updateSupplement(supplement.supplement_id, 'is_core', !supplement.is_core)
                            }
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              supplement.is_core ? 'text-orange-600' : 'text-gray-500'
                            }`}
                          >
                            <FiStar className={supplement.is_core ? 'fill-current' : ''} size={12} />
                            {supplement.is_core ? 'Core supplement' : 'Optional'}
                          </button>
                        </div>
                      </Inline>
                      <button
                        type="button"
                        onClick={() => removeSupplement(supplement.supplement_id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <FiX size={18} />
                      </button>
                    </Inline>

                    <Grid cols={{ sm: 2 }} gap={3}>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={supplement.dosage || ''}
                          onChange={(e) =>
                            updateSupplement(supplement.supplement_id, 'dosage', e.target.value)
                          }
                          placeholder="e.g., 500mg"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={supplement.frequency || ''}
                          onChange={(e) =>
                            updateSupplement(supplement.supplement_id, 'frequency', e.target.value)
                          }
                          placeholder="e.g., Daily"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Timing</label>
                        <input
                          type="text"
                          value={supplement.timing || ''}
                          onChange={(e) =>
                            updateSupplement(supplement.supplement_id, 'timing', e.target.value)
                          }
                          placeholder="e.g., Morning with food"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Notes</label>
                        <input
                          type="text"
                          value={supplement.notes || ''}
                          onChange={(e) =>
                            updateSupplement(supplement.supplement_id, 'notes', e.target.value)
                          }
                          placeholder="Any additional notes"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </Grid>
                  </div>
                ))}
              </Stack>
            )}

            {/* Add Supplement Search */}
            <div className="relative">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSupplementPicker(true);
                  }}
                  onFocus={() => setShowSupplementPicker(true)}
                  placeholder="Search supplements to add..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {showSupplementPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {supplementsLoading ? (
                    <div className="p-4 text-center">
                      <Spinner size="sm" />
                    </div>
                  ) : availableSupplements.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchTerm ? 'No supplements found' : 'All supplements added'}
                    </div>
                  ) : (
                    <>
                      {availableSupplements.slice(0, 10).map((supplement) => (
                        <button
                          key={supplement.supplement_id}
                          type="button"
                          onClick={() => addSupplement(supplement)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FiPlus className="text-gray-400" size={14} />
                          <span>{supplement.supplement_name}</span>
                        </button>
                      ))}
                      {availableSupplements.length > 10 && (
                        <div className="px-4 py-2 text-xs text-gray-500 border-t">
                          +{availableSupplements.length - 10} more results
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Click outside to close */}
            {showSupplementPicker && (
              <div className="fixed inset-0 z-0" onClick={() => setShowSupplementPicker(false)} />
            )}
          </Card>

          {/* Source (Optional) */}
          <Card padding="lg">
            <h2 className="font-semibold text-gray-900 mb-1">Source Attribution</h2>
            <p className="text-sm text-gray-500 mb-4">
              Optional - credit where you learned about this stack
            </p>

            <Stack gap={4}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
                <Inline gap={2} wrap>
                  {sourceTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSourceType(sourceType === type.value ? '' : type.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        sourceType === type.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.icon}
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </Inline>
              </div>

              <Input
                label="Source Title"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="e.g., Dr. Huberman's Morning Routine Episode"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                <div className="relative">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <Input
                label="Source Date"
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
              />
            </Stack>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <Inline gap={3}>
            <Link href="/stacks" className="flex-1">
              <Button type="button" variant="outline" fullWidth>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={!stackName.trim() || supplements.length === 0}
            >
              Create Stack
            </Button>
          </Inline>
        </Stack>
      </form>
    </main>
  );
}
