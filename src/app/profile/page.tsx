'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiSettings,
  FiUser,
  FiDollarSign,
  FiGlobe,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLayers,
  FiPlus,
  FiTrash2,
  FiEye,
  FiLock,
  FiBookOpen,
  FiPackage,
} from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '../supabase';
import type { RegimenItem, UserSupplementSettingsInput } from '@/types';
import { formatCurrency, feetInchesToCm, cmToFeetInches, lbsToKg, kgToLbs } from '@/lib/utils';
import { useRegimenCost, useSupplementLogs, useSupplementSettings, useStacks } from '@/hooks';
import Link from 'next/link';
import {
  Button,
  Input,
  Select,
  Card,
  Spinner,
  Avatar,
  Tabs,
  EmptyState,
  Stack,
  Inline,
  Grid,
  useToast,
  ConfirmDialog,
} from '@/components/ui';
import { SupplementSettingsModal } from '@/components/composite/Tracking';

type TabType = 'collection' | 'journal' | 'stacks' | 'profile';

const tabItems: { id: TabType; label: string; icon?: React.ReactNode }[] = [
  { id: 'collection', label: 'My Collection', icon: <FiPackage size={16} /> },
  { id: 'journal', label: 'Journal', icon: <FiBookOpen size={16} /> },
  { id: 'stacks', label: 'My Stacks', icon: <FiLayers size={16} /> },
  { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
];

export default function Profile() {
  const { user, logout, loading: authLoading } = useAuth() || {};
  const router = useRouter();
  const toast = useToast();

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('collection');

  // Profile form state
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [heightFt, setHeightFt] = useState<number | ''>('');
  const [heightIn, setHeightIn] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Collection state
  const [regimen, setRegimen] = useState<RegimenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings modal
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ stackId: string; stackName: string } | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Journal logs
  const { logs, isLoading: logsLoading } = useSupplementLogs();

  const { settings, getSettings, createSettings } = useSupplementSettings();

  // Stacks hook
  const {
    stacks: myStacks,
    isLoading: stacksLoading,
    deleteStack,
    refetch: refetchStacks,
  } = useStacks({ filter: 'my_stacks' });

  // Calculate costs
  const regimenItems = regimen.map((item) => ({
    product_price: item.products.product_price,
    servings_per_container: item.products.servings_per_container,
    servings_per_day: item.products.servings_per_day,
  }));
  const { totalMonthlyCost, itemCount } = useRegimenCost(regimenItems);

  const fetchRegimen = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users_products')
        .select(
          `
          product_id,
          products (
            product_name, product_description, product_price,
            servings_per_container, servings_per_day,
            brands (brand_name),
            supplements (supplement_name)
          )
        `
        )
        .eq('user_id', user.id);

      if (error) throw error;

      const mappedData = (data || []).map((item: any) => ({
        product_id: item.product_id,
        products: {
          product_name: item.products?.product_name || '',
          product_description: item.products?.product_description || '',
          product_price: item.products?.product_price || 0,
          servings_per_container: item.products?.servings_per_container || 0,
          servings_per_day: item.products?.servings_per_day || 0,
          brands: { brand_name: item.products?.brands?.brand_name || '' },
          supplements: { supplement_name: item.products?.supplements?.supplement_name || '' },
        },
      }));

      setRegimen(mappedData);
    } catch (error) {
      console.error('Error fetching regimen:', error);
    }
  }, [user]);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setDateOfBirth(data.date_of_birth || '');
        setGender(data.gender || '');
        if (data.height) {
          const { feet, inches } = cmToFeetInches(data.height);
          setHeightFt(feet);
          setHeightIn(inches);
        }
        setWeight(data.weight ? Math.round(kgToLbs(data.weight)) : '');
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setWebsite(data.website || '');
        setTwitterHandle(data.twitter_handle || '');
        setInstagramHandle(data.instagram_handle || '');
        setYoutubeChannel(data.youtube_channel || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user]);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    Promise.all([fetchRegimen(), fetchUserProfile()]).finally(() => setIsLoading(false));
  }, [user, authLoading, router, fetchRegimen, fetchUserProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    const heightCm =
      heightFt && heightIn !== '' ? feetInchesToCm(Number(heightFt), Number(heightIn)) : null;
    const weightKg = weight ? lbsToKg(Number(weight)) : null;

    try {
      const { error } = await supabase.from('user_profiles').upsert({
        id: user.id,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        height: heightCm,
        weight: weightKg,
        display_name: displayName || null,
        bio: bio || null,
        website: website || null,
        twitter_handle: twitterHandle || null,
        instagram_handle: instagramHandle || null,
        youtube_channel: youtubeChannel || null,
      });

      if (error) throw error;
      toast.success('Profile updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout?.();
    router.push('/');
  };

  const handleOpenSettings = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setSettingsModalOpen(true);
  };

  const handleSaveSettings = async (settingsInput: UserSupplementSettingsInput) => {
    await createSettings(settingsInput);
  };

  const handleDeleteStack = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await deleteStack(deleteConfirm.stackId);
      await refetchStacks();
      toast.success('Stack deleted');
    } catch (error) {
      console.error('Error deleting stack:', error);
      toast.error('Failed to delete stack');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12 pb-8 border-b border-gray-200">
          <Inline justify="between" align="start">
            <div className="flex items-start gap-6">
              <Avatar
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.full_name || 'User'}
                size="xl"
              />
              <div>
                <h1 className="text-3xl font-serif text-gray-900 mb-1">
                  {displayName || user.user_metadata?.full_name || 'Welcome'}
                </h1>
                <p className="text-gray-500 text-sm">{user.email}</p>
                {bio && <p className="text-gray-600 mt-3 max-w-md">{bio}</p>}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </Inline>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-8 mb-12 pb-8 border-b border-gray-100">
          <div>
            <p className="text-3xl font-serif text-gray-900">{itemCount}</p>
            <p className="text-sm text-gray-500 mt-1">Supplements</p>
          </div>
          <div>
            <p className="text-3xl font-serif text-gray-900">{formatCurrency(totalMonthlyCost)}</p>
            <p className="text-sm text-gray-500 mt-1">Monthly Cost</p>
          </div>
          <div>
            <p className="text-3xl font-serif text-gray-900">{myStacks.length}</p>
            <p className="text-sm text-gray-500 mt-1">Stacks Created</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs.List variant="underline" className="mb-10">
          {tabItems.map((tab) => (
            <Tabs.Tab
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {/* Tab Content */}
        {activeTab === 'collection' && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif text-gray-900">My Collection</h2>
                <p className="text-gray-500 mt-1">Supplements you&apos;re currently taking</p>
              </div>
              <Button variant="primary" onClick={() => router.push('/')}>
                Add Supplements
              </Button>
            </div>

            {regimen.length === 0 ? (
              <EmptyState
                icon={<FiPackage size={32} className="text-gray-400" />}
                title="No supplements yet"
                description="Start building your collection to track what you're taking."
                action={
                  <Button variant="primary" onClick={() => router.push('/')}>
                    Browse Supplements
                  </Button>
                }
                variant="card"
                size="lg"
              />
            ) : (
              <div className="space-y-4">
                {regimen.map((item) => {
                  const pricePerServing =
                    item.products.product_price / item.products.servings_per_container;
                  const costPerMonth = pricePerServing * item.products.servings_per_day * 30.437;
                  const productSettings = getSettings(item.product_id);

                  return (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.products.product_name}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {item.products.supplements.supplement_name} &middot;{' '}
                          {item.products.brands.brand_name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{formatCurrency(costPerMonth)}/mo</span>
                          {productSettings?.custom_dosage && (
                            <span>&middot; {productSettings.custom_dosage}</span>
                          )}
                          {productSettings?.goal && (
                            <span className="text-accent-600">&middot; {productSettings.goal}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {productSettings?.status === 'paused' && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            Paused
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleOpenSettings(item.product_id, item.products.product_name)
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FiSettings size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Total Cost Summary */}
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Total Monthly Cost</span>
                  <span className="text-xl font-serif text-gray-900">
                    {formatCurrency(totalMonthlyCost)}
                  </span>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'journal' && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif text-gray-900">Journal</h2>
                <p className="text-gray-500 mt-1">Notes and observations about your supplements</p>
              </div>
            </div>

            {logsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : logs.length === 0 ? (
              <EmptyState
                icon={<FiBookOpen size={32} className="text-gray-400" />}
                title="No journal entries"
                description="Log notes about how supplements are working for you."
                variant="card"
                size="lg"
              />
            ) : (
              <div className="space-y-6">
                {logs.slice(0, 20).map((log) => (
                  <div key={log.log_id} className="py-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{formatDate(log.logged_at)}</p>
                        <h4 className="font-medium text-gray-900 mt-1">
                          {log.products?.product_name || 'Supplement'}
                        </h4>
                        {log.notes && <p className="text-gray-600 mt-2">{log.notes}</p>}
                        {(log.mood_before || log.mood_after || log.energy_level) && (
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            {log.energy_level && <span>Energy: {log.energy_level}/5</span>}
                            {log.mood_before && <span>Mood before: {log.mood_before}</span>}
                            {log.mood_after && <span>Mood after: {log.mood_after}</span>}
                          </div>
                        )}
                      </div>
                      {log.time_of_day && (
                        <span className="text-xs text-gray-400 capitalize">{log.time_of_day}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'stacks' && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif text-gray-900">My Stacks</h2>
                <p className="text-gray-500 mt-1">Supplement combinations you&apos;ve created</p>
              </div>
              <Link href="/stacks/create">
                <Button variant="primary" leftIcon={<FiPlus />}>
                  Create Stack
                </Button>
              </Link>
            </div>

            {stacksLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : myStacks.length === 0 ? (
              <EmptyState
                icon={<FiLayers size={32} className="text-gray-400" />}
                title="No stacks yet"
                description="Create and share your supplement combinations with the community."
                action={
                  <Link href="/stacks/create">
                    <Button variant="primary" leftIcon={<FiPlus />}>
                      Create Your First Stack
                    </Button>
                  </Link>
                }
                variant="card"
                size="lg"
              />
            ) : (
              <div className="space-y-4">
                {myStacks.map((stack) => (
                  <div
                    key={stack.stack_id}
                    className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/stacks/${stack.stack_id}`}
                          className="font-medium text-gray-900 hover:text-accent-600 transition-colors truncate"
                        >
                          {stack.stack_name}
                        </Link>
                        {stack.is_public ? (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FiEye size={12} />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <FiLock size={12} />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {stack.stack_description || 'No description'}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>{stack.supplements?.length || 0} supplements</span>
                        <span>{stack.view_count || 0} views</span>
                        <span>{stack.like_count || 0} likes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/stacks/${stack.stack_id}`}>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <FiEye size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ stackId: stack.stack_id, stackName: stack.stack_name })
                        }
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="text-center pt-6">
                  <Link href="/stacks" className="text-sm text-gray-500 hover:text-gray-900">
                    Browse all stacks
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'profile' && (
          <section>
            <div className="max-w-2xl">
              <h2 className="text-2xl font-serif text-gray-900 mb-8">Profile Settings</h2>

              <form onSubmit={handleProfileUpdate}>
                <Stack gap={8}>
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                      Basic Information
                    </h3>
                    <Grid cols={{ sm: 1, md: 2 }} gap={6}>
                      <Input
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your public display name"
                      />

                      <Input
                        label="Date of Birth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />

                      <Select
                        label="Gender"
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                        ]}
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        placeholder="Select gender"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (ft&apos;in&quot;)
                        </label>
                        <Inline gap={2}>
                          <Input
                            type="number"
                            value={heightFt}
                            onChange={(e) => setHeightFt(e.target.value ? Number(e.target.value) : '')}
                            placeholder="ft"
                          />
                          <Input
                            type="number"
                            value={heightIn}
                            onChange={(e) => setHeightIn(e.target.value ? Number(e.target.value) : '')}
                            placeholder="in"
                          />
                        </Inline>
                      </div>

                      <Input
                        label="Weight (lbs)"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                      />
                    </Grid>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                      Social Links
                    </h3>
                    <Grid cols={{ sm: 1, md: 2 }} gap={6}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiGlobe className="inline mr-2 text-gray-400" size={14} />
                          Website
                        </label>
                        <Input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiTwitter className="inline mr-2 text-gray-400" size={14} />
                          Twitter / X
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                            @
                          </span>
                          <input
                            value={twitterHandle}
                            onChange={(e) => setTwitterHandle(e.target.value)}
                            placeholder="username"
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-r focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiInstagram className="inline mr-2 text-gray-400" size={14} />
                          Instagram
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                            @
                          </span>
                          <input
                            value={instagramHandle}
                            onChange={(e) => setInstagramHandle(e.target.value)}
                            placeholder="username"
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-r focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiYoutube className="inline mr-2 text-gray-400" size={14} />
                          YouTube
                        </label>
                        <Input
                          value={youtubeChannel}
                          onChange={(e) => setYoutubeChannel(e.target.value)}
                          placeholder="https://youtube.com/@channel"
                        />
                      </div>
                    </Grid>
                  </div>

                  <div>
                    <Button type="submit" variant="primary" isLoading={isSaving}>
                      Save Changes
                    </Button>
                  </div>
                </Stack>
              </form>
            </div>
          </section>
        )}

        {/* Settings Modal */}
        {selectedProduct && (
          <SupplementSettingsModal
            isOpen={settingsModalOpen}
            onClose={() => {
              setSettingsModalOpen(false);
              setSelectedProduct(null);
            }}
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            existingSettings={getSettings(selectedProduct.id)}
            onSave={handleSaveSettings}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteStack}
          title="Delete Stack"
          description={`Are you sure you want to delete "${deleteConfirm?.stackName}"? This cannot be undone.`}
          confirmText="Delete"
          danger
          isLoading={isDeleting}
        />
      </div>
    </main>
  );
}
