"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '../supabase';
import type { RegimenItem, ProfileInput } from '@/types';
import { formatCurrency, feetInchesToCm, cmToFeetInches, lbsToKg, kgToLbs } from '@/lib/utils';
import { useRegimenCost } from '@/hooks';
import { Button, Input, Select, Card, Spinner } from '@/components/ui';

export default function Profile() {
  const { user, logout } = useAuth() || {};
  const router = useRouter();

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
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gradient">My Stack</h1>
        <p className="text-xl text-gray-600">Manage your supplements and track your progress</p>
      </header>

      {/* Personal Information */}
      <Card variant="modern" className="mb-12 p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Personal Information</h2>

        <div className="flex items-center mb-6">
          <Image
            src={user.user_metadata?.avatar_url || "/placeholder-avatar.jpg"}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full mr-6"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user.user_metadata?.full_name || 'User'}
            </h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <Card variant="modern" className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Total Supplements</h3>
          <p className="text-3xl font-bold text-orange-600">{itemCount}</p>
        </Card>
        <Card variant="modern" className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Monthly Cost</h3>
          <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalMonthlyCost)}</p>
        </Card>
      </div>

      {/* Regimen Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">My Supplement Regimen</h2>

        {regimen.length === 0 ? (
          <Card variant="modern" className="p-8 text-center">
            <p className="text-gray-600 mb-4">You haven&apos;t added any supplements to your stack yet.</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Browse Supplements
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Supplement</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Brand</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Cost/Month</th>
                </tr>
              </thead>
              <tbody>
                {regimen.map((item) => {
                  const pricePerServing = item.products.product_price / item.products.servings_per_container;
                  const costPerMonth = pricePerServing * item.products.servings_per_day * 30.437;
                  return (
                    <tr key={item.product_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b text-sm text-gray-800">{item.products.product_name}</td>
                      <td className="py-3 px-4 border-b text-sm text-gray-800">{item.products.supplements.supplement_name}</td>
                      <td className="py-3 px-4 border-b text-sm text-gray-800">{item.products.brands.brand_name}</td>
                      <td className="py-3 px-4 border-b text-sm text-gray-800">{formatCurrency(costPerMonth)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Logout */}
      <Button variant="accent" onClick={handleLogout}>
        Logout
      </Button>
    </main>
  );
}
