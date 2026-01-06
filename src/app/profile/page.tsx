"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSettings, FiUser, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '../supabase';
import type { RegimenItem, TimeOfDay, UserSupplementSettingsInput } from '@/types';
import { formatCurrency, feetInchesToCm, cmToFeetInches, lbsToKg, kgToLbs } from '@/lib/utils';
import { useRegimenCost, useSupplementLogs, useSupplementSettings } from '@/hooks';
import { Button, Input, Select, Card, Spinner } from '@/components/ui';
import {
  DailyLogCard,
  TrackingStats,
  WeeklyCalendar,
  SupplementSettingsModal,
} from '@/components/composite/Tracking';

type TabType = 'tracking' | 'regimen' | 'profile';

export default function Profile() {
  const { user, logout } = useAuth() || {};
  const router = useRouter();

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('tracking');

  // Profile form state
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [heightFt, setHeightFt] = useState<number | ''>('');
  const [heightIn, setHeightIn] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  // Regimen state
  const [regimen, setRegimen] = useState<RegimenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings modal
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);

  // Tracking hooks
  const {
    logs,
    todayLogs,
    dailySummary,
    stats,
    logSupplement,
    unlogSupplement,
    isLoading: logsLoading,
  } = useSupplementLogs();

  const {
    settings,
    getSettings,
    createSettings,
  } = useSupplementSettings();

  // Calculate costs using hook
  const regimenItems = regimen.map(item => ({
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
        .select(`
          product_id,
          products (
            product_name, product_description, product_price,
            servings_per_container, servings_per_day,
            brands (brand_name),
            supplements (supplement_name)
          )
        `)
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
    Promise.all([fetchRegimen(), fetchUserProfile()])
      .finally(() => setIsLoading(false));
  }, [user, router, fetchRegimen, fetchUserProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    const heightCm = heightFt && heightIn !== ''
      ? feetInchesToCm(Number(heightFt), Number(heightIn))
      : null;
    const weightKg = weight ? lbsToKg(Number(weight)) : null;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          height: heightCm,
          weight: weightKg,
        });

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
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

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="container-custom py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={user.user_metadata?.avatar_url || "/placeholder-avatar.jpg"}
              alt="User Avatar"
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.user_metadata?.full_name || 'Welcome back!'}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="modern" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <FiPieChart className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Progress</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(dailySummary?.completion_percentage || 0)}%
              </p>
            </div>
          </div>
        </Card>
        <Card variant="modern" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <span className="text-green-600 text-lg">🔥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="text-xl font-bold text-gray-900">
                {stats?.currentStreak || 0} days
              </p>
            </div>
          </div>
        </Card>
        <Card variant="modern" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <span className="text-blue-600 text-lg">💊</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Supplements</p>
              <p className="text-xl font-bold text-gray-900">{itemCount}</p>
            </div>
          </div>
        </Card>
        <Card variant="modern" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <FiDollarSign className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Cost</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalMonthlyCost)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'tracking'
              ? 'text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Daily Tracking
          {activeTab === 'tracking' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('regimen')}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'regimen'
              ? 'text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Regimen
          {activeTab === 'regimen' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'profile'
              ? 'text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiUser className="inline mr-1" size={16} />
          Profile
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Log Card */}
            <DailyLogCard
              regimen={regimen}
              todayLogs={todayLogs}
              onLog={handleLogSupplement}
              onUnlog={handleUnlogSupplement}
              isLoading={logsLoading}
            />

            {/* Weekly Calendar */}
            <WeeklyCalendar
              logs={logs}
              plannedCount={regimen.length}
            />
          </div>

          {/* Stats Sidebar */}
          <div>
            <TrackingStats
              stats={stats}
              dailySummary={dailySummary}
            />
          </div>
        </div>
      )}

      {activeTab === 'regimen' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">My Supplement Regimen</h2>
            <Button variant="primary" onClick={() => router.push('/')}>
              Add Supplements
            </Button>
          </div>

          {regimen.length === 0 ? (
            <Card variant="modern" className="p-8 text-center">
              <div className="text-5xl mb-4">💊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Supplements Yet</h3>
              <p className="text-gray-600 mb-4">Start building your supplement stack to track your daily intake.</p>
              <Button variant="primary" onClick={() => router.push('/')}>
                Browse Supplements
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {regimen.map((item) => {
                const pricePerServing = item.products.product_price / item.products.servings_per_container;
                const costPerMonth = pricePerServing * item.products.servings_per_day * 30.437;
                const productSettings = getSettings(item.product_id);

                return (
                  <Card key={item.product_id} variant="modern" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.products.product_name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.products.supplements.supplement_name} • {item.products.brands.brand_name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{formatCurrency(costPerMonth)}/mo</span>
                          {productSettings?.custom_dosage && (
                            <span>• {productSettings.custom_dosage}</span>
                          )}
                          {productSettings?.goal && (
                            <span className="text-orange-600">• Goal: {productSettings.goal}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {productSettings?.status === 'paused' && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                            Paused
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenSettings(item.product_id, item.products.product_name)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiSettings size={18} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Total Cost Summary */}
              <Card variant="modern" className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total Monthly Cost</span>
                  <span className="text-xl font-bold text-orange-600">{formatCurrency(totalMonthlyCost)}</span>
                </div>
              </Card>
            </div>
          )}
        </section>
      )}

      {activeTab === 'profile' && (
        <Card variant="modern" className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Personal Information</h2>

          <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex gap-2">
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
              </div>
            </div>

            <Input
              label="Weight (lbs)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
            />

            <div className="col-span-2">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Update Profile
              </Button>
            </div>
          </form>
        </Card>
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
    </main>
  );
}
