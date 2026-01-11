'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiSettings,
  FiUser,
  FiDollarSign,
  FiPieChart,
  FiGlobe,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLayers,
  FiPlus,
  FiTrash2,
  FiEye,
  FiLock,
} from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '../supabase';
import type { RegimenItem, TimeOfDay, UserSupplementSettingsInput } from '@/types';
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
  StatCard,
  Tabs,
  EmptyState,
  Stack,
  Inline,
  Grid,
  useToast,
  ConfirmDialog,
} from '@/components/ui';
import {
  DailyLogCard,
  DailyWellnessCard,
  TrackingStats,
  WeeklyCalendar,
  SupplementSettingsModal,
} from '@/components/composite/Tracking';

type TabType = 'tracking' | 'regimen' | 'stacks' | 'profile';

const tabItems: { id: TabType; label: string; icon?: React.ReactNode }[] = [
  { id: 'tracking', label: 'Daily Tracking' },
  { id: 'regimen', label: 'My Regimen' },
  { id: 'stacks', label: 'My Stacks', icon: <FiLayers size={16} /> },
  { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
];

export default function Profile() {
  const { user, logout } = useAuth() || {};
  const router = useRouter();
  const toast = useToast();

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('tracking');

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

  // Regimen state
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

  // Tracking hooks
  const {
    logs,
    todayLogs,
    dailySummary,
    stats,
    logSupplement,
    unlogSupplement,
    saveWellnessData,
    isLoading: logsLoading,
  } = useSupplementLogs();

  const { settings, getSettings, createSettings } = useSupplementSettings();

  // Stacks hook (filter: my_stacks shows both public and private)
  const {
    stacks: myStacks,
    isLoading: stacksLoading,
    deleteStack,
    refetch: refetchStacks,
  } = useStacks({ filter: 'my_stacks' });

  // Calculate costs using hook
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
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    Promise.all([fetchRegimen(), fetchUserProfile()]).finally(() => setIsLoading(false));
  }, [user, router, fetchRegimen, fetchUserProfile]);

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
      toast.success('Profile updated successfully!');
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

  const handleLogSupplement = async (productId: string, timeOfDay?: TimeOfDay) => {
    try {
      await logSupplement({ product_id: productId, time_of_day: timeOfDay });
    } catch (error) {
      console.error('Error logging supplement:', error);
    }
  };

  const handleUnlogSupplement = async (logId: string) => {
    try {
      await unlogSupplement(logId);
    } catch (error) {
      console.error('Error unlogging supplement:', error);
    }
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
      toast.success('Stack deleted successfully');
    } catch (error) {
      console.error('Error deleting stack:', error);
      toast.error('Failed to delete stack');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <Inline justify="between" align="center">
          <Inline gap={4} align="center">
            <Avatar
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name || 'User'}
              size="xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.user_metadata?.full_name || 'Welcome back!'}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </Inline>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </Inline>
      </header>

      {/* Quick Stats Bar */}
      <Grid cols={{ sm: 2, lg: 4 }} gap={4} className="mb-8">
        <StatCard
          icon={<FiPieChart size={20} />}
          label="Today's Progress"
          value={`${Math.round(dailySummary?.completion_percentage || 0)}%`}
          variant="orange"
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${stats?.currentStreak || 0} days`}
          variant="green"
        />
        <StatCard
          icon="💊"
          label="Total Supplements"
          value={itemCount}
          variant="blue"
        />
        <StatCard
          icon={<FiDollarSign size={20} />}
          label="Monthly Cost"
          value={formatCurrency(totalMonthlyCost)}
          variant="purple"
        />
      </Grid>

      {/* Tab Navigation */}
      <Tabs.List variant="underline" className="mb-8">
        {tabItems.map((tab) => (
          <Tabs.Tab
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Area */}
          <Stack gap={8} className="lg:col-span-2">
            {/* Daily Wellness Check-in */}
            <DailyWellnessCard
              dailySummary={dailySummary}
              onSave={saveWellnessData}
              isLoading={logsLoading}
            />

            {/* Daily Log Card */}
            <DailyLogCard
              regimen={regimen}
              todayLogs={todayLogs}
              onLog={handleLogSupplement}
              onUnlog={handleUnlogSupplement}
              isLoading={logsLoading}
            />

            {/* Weekly Calendar */}
            <WeeklyCalendar logs={logs} plannedCount={regimen.length} />
          </Stack>

          {/* Stats Sidebar */}
          <div>
            <TrackingStats stats={stats} dailySummary={dailySummary} />
          </div>
        </div>
      )}

      {activeTab === 'regimen' && (
        <section>
          <Inline justify="between" align="center" className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">My Supplement Regimen</h2>
            <Button variant="primary" onClick={() => router.push('/')}>
              Add Supplements
            </Button>
          </Inline>

          {regimen.length === 0 ? (
            <EmptyState
              icon="💊"
              title="No Supplements Yet"
              description="Start building your supplement stack to track your daily intake."
              action={
                <Button variant="primary" onClick={() => router.push('/')}>
                  Browse Supplements
                </Button>
              }
              variant="card"
              size="lg"
            />
          ) : (
            <Stack gap={4}>
              {regimen.map((item) => {
                const pricePerServing =
                  item.products.product_price / item.products.servings_per_container;
                const costPerMonth = pricePerServing * item.products.servings_per_day * 30.437;
                const productSettings = getSettings(item.product_id);

                return (
                  <Card key={item.product_id} padding="md">
                    <Inline justify="between" align="center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.products.product_name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.products.supplements.supplement_name} •{' '}
                          {item.products.brands.brand_name}
                        </p>
                        <Inline gap={4} className="mt-2 text-sm text-gray-600">
                          <span>{formatCurrency(costPerMonth)}/mo</span>
                          {productSettings?.custom_dosage && (
                            <span>• {productSettings.custom_dosage}</span>
                          )}
                          {productSettings?.goal && (
                            <span className="text-orange-600">• Goal: {productSettings.goal}</span>
                          )}
                        </Inline>
                      </div>
                      <Inline gap={2}>
                        {productSettings?.status === 'paused' && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                            Paused
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleOpenSettings(item.product_id, item.products.product_name)
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiSettings size={18} />
                        </button>
                      </Inline>
                    </Inline>
                  </Card>
                );
              })}

              {/* Total Cost Summary */}
              <Card padding="md" className="bg-gray-50">
                <Inline justify="between" align="center">
                  <span className="font-medium text-gray-700">Total Monthly Cost</span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(totalMonthlyCost)}
                  </span>
                </Inline>
              </Card>
            </Stack>
          )}
        </section>
      )}

      {activeTab === 'stacks' && (
        <section>
          <Inline justify="between" align="center" className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">My Stacks</h2>
            <Link href="/stacks/create">
              <Button variant="primary" leftIcon={<FiPlus />}>
                Create Stack
              </Button>
            </Link>
          </Inline>

          {stacksLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : myStacks.length === 0 ? (
            <EmptyState
              icon="📚"
              title="No Stacks Yet"
              description="Create and share your supplement routines with the community."
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
            <Stack gap={4}>
              {myStacks.map((stack) => (
                <Card key={stack.stack_id} padding="md">
                  <Inline justify="between" align="center">
                    <div className="flex-1 min-w-0">
                      <Inline gap={2} align="center">
                        <Link
                          href={`/stacks/${stack.stack_id}`}
                          className="font-semibold text-gray-900 hover:text-orange-600 truncate"
                        >
                          {stack.stack_name}
                        </Link>
                        {stack.is_public ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <FiEye size={12} /> Public
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <FiLock size={12} /> Private
                          </span>
                        )}
                      </Inline>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {stack.stack_description || 'No description'}
                      </p>
                      <Inline gap={4} className="mt-2 text-xs text-gray-500">
                        <span>{stack.supplements?.length || 0} supplements</span>
                        <span>{stack.view_count || 0} views</span>
                        <span>{stack.like_count || 0} likes</span>
                        <span>{stack.copy_count || 0} copies</span>
                      </Inline>
                    </div>
                    <Inline gap={2} className="ml-4">
                      <Link href={`/stacks/${stack.stack_id}`}>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiEye size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ stackId: stack.stack_id, stackName: stack.stack_name })
                        }
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </Inline>
                  </Inline>
                </Card>
              ))}

              {/* Browse More */}
              <div className="text-center pt-4">
                <Link href="/stacks" className="text-sm text-orange-600 hover:text-orange-700">
                  Browse all stacks →
                </Link>
              </div>
            </Stack>
          )}
        </section>
      )}

      {activeTab === 'profile' && (
        <Stack gap={6}>
          {/* Personal Information */}
          <Card padding="lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Personal Information</h2>

            <form onSubmit={handleProfileUpdate}>
              <Stack gap={8}>
                {/* Basic Info */}
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a bit about yourself and your health journey..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                  </div>
                </Grid>

                {/* Social Links Section */}
                <div>
                  <Inline gap={2} className="text-lg font-medium text-gray-900 mb-4">
                    <FiGlobe className="text-gray-500" />
                    Social Links
                  </Inline>
                  <Grid cols={{ sm: 1, md: 2 }} gap={6}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiGlobe className="inline mr-2 text-gray-400" />
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
                        <FiTwitter className="inline mr-2 text-blue-400" />
                        Twitter / X
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          @
                        </span>
                        <input
                          value={twitterHandle}
                          onChange={(e) => setTwitterHandle(e.target.value)}
                          placeholder="username"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiInstagram className="inline mr-2 text-pink-500" />
                        Instagram
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          @
                        </span>
                        <input
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="username"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiYoutube className="inline mr-2 text-red-500" />
                        YouTube Channel
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
                    Update Profile
                  </Button>
                </div>
              </Stack>
            </form>
          </Card>
        </Stack>
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
        description={`Are you sure you want to delete "${deleteConfirm?.stackName}"? This action cannot be undone.`}
        confirmText="Delete"
        danger
        isLoading={isDeleting}
      />
    </main>
  );
}
