"use client";

import React from 'react';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import Image from 'next/image';

interface RegimenItem {
  product_id: string;
  products: {
    product_name: string;
    product_description: string | null;
    product_price: number;
    servings_per_container: number;
    servings_per_day: number;
    brands: {
      brand_name: string;
    };
    supplements: {
      supplement_name: string;
    };
  };
}

export default function Profile() {
  const { user, logout } = useAuth() || {};
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [heightFt, setHeightFt] = useState<number | ''>('');
  const [heightIn, setHeightIn] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [regimen, setRegimen] = useState<RegimenItem[]>([]);
  const [totalSupplements, setTotalSupplements] = useState<number>(0);
  const [monthlyCost, setMonthlyCost] = useState<number>(0);
  const router = useRouter();

  const fetchRegimen = useCallback(async () => {
    if (!user) {
      console.log('No user found, returning from fetchRegimen');
      return;
    }
    try {
      console.log('Fetching regimen for user:', user.id);
      const { data, error } = await supabase
        .from('users_products')
        .select(`
          product_id,
          products (
            product_name,
            product_description,
            product_price,
            servings_per_container,
            servings_per_day,
            brands (brand_name),
            supplements (supplement_name)
          )
        `)
        .eq('user_id', user.id);

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Error fetching regimen:', error);
        throw error;
      }
      if (data) {
        console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));
        const mappedData = data.map((item: any) => ({
          product_id: item.product_id,
          products: {
            product_name: item.products?.product_name || '',
            product_description: item.products?.product_description || '',
            product_price: item.products?.product_price || 0,
            servings_per_container: item.products?.servings_per_container || 0,
            servings_per_day: item.products?.servings_per_day || 0,
            brands: {
              brand_name: item.products?.brands?.brand_name || '',
            },
            supplements: {
              supplement_name: item.products?.supplements?.supplement_name || '',
            },
          },
        }));
        console.log('Mapped regimen data:', JSON.stringify(mappedData, null, 2));
        setRegimen(mappedData);

        // Calculate total products and monthly cost
        const totalProducts = mappedData.length;
        setTotalSupplements(totalProducts);
        const dailyCost = mappedData.reduce((sum, item) => {
          const pricePerServing = item.products.product_price / item.products.servings_per_container;
          const dailyCost = pricePerServing * item.products.servings_per_day;
          return sum + dailyCost;
        }, 0);
        setMonthlyCost(dailyCost * 30.437);
      } else {
        console.log('No data returned from Supabase');
        setRegimen([]);
        setTotalSupplements(0);
        setMonthlyCost(0);
      }
    } catch (error) {
      console.error('Error in fetchRegimen:', error);
    }
  }, [user]);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, it may be created soon');
      } else {
        console.error('Error fetching user profile:', profileError);
      }
    } else if (profileData) {
      setDateOfBirth(profileData.date_of_birth || '');
      setGender(profileData.gender || '');
      if (profileData.height) {
        setHeightFt(Math.floor(profileData.height / 30.48));
        setHeightIn(Math.round((profileData.height % 30.48) / 2.54));
      }
      setWeight(profileData.weight ? Math.round(profileData.weight * 2.20462) : '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchRegimen();
      fetchUserProfile();
    }
  }, [user, router, fetchRegimen, fetchUserProfile]);

  const handleLogout = async () => {
    await logout?.();
    router.push('/');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const heightCm = heightFt && heightIn ? (Number(heightFt) * 30.48) + (Number(heightIn) * 2.54) : null;
    const weightKg = weight ? Number(weight) / 2.20462 : null;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        date_of_birth: dateOfBirth,
        gender,
        height: heightCm,
        weight: weightKg
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }

    alert('Profile updated successfully!');
  };

  if (!user) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">My Stack</h1>
        <p className="text-xl text-gray-600">Manage your supplements and track your progress</p>
      </header>

      <section className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-blue-600">Personal Information</h2>
        <div className="flex items-center mb-6">
          <Image
            src={user.user_metadata.avatar_url || "/placeholder-avatar.jpg"}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full mr-6"
          />
          <div>
            <h3 className="text-xl font-semibold">{user.user_metadata.full_name || 'User'}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (ft&apos;in&quot;)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="heightFt"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="ft"
              />
              <input
                type="number"
                id="heightIn"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="in"
              />
            </div>
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
              Update Profile
            </button>
          </div>
        </form>
      </section>

      <section className="mb-12 grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Total Supplements</h3>
          <p className="text-3xl font-bold text-blue-600">{totalSupplements}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Monthly Cost</h3>
          <p className="text-3xl font-bold text-blue-600">${monthlyCost.toFixed(2)}</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-blue-600">My Supplement Regimen</h2>
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Product Name</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Supplement Name</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Brand Name</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Cost/Month</th>
              </tr>
            </thead>
            <tbody>
              {regimen.map((item) => {
                const pricePerServing = item.products.product_price / item.products.servings_per_container;
                const costPerMonth = pricePerServing * item.products.servings_per_day * 30.437;
                return (
                  <tr key={item.product_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-sm text-gray-800">{item.products.product_name}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-800">{item.products.supplements.supplement_name}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-800">{item.products.brands.brand_name}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-800">${costPerMonth.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 ease-in-out"
      >
        Logout
      </button>
    </main>
  );
}