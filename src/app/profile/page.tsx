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

        // Calculate total supplements and monthly cost
        const uniqueSupplements = new Set(mappedData.map(item => item.products.supplements.supplement_name));
        setTotalSupplements(uniqueSupplements.size);
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchRegimen();
    }
  }, [user, router, fetchRegimen]);

  const handleLogout = async () => {
    await logout?.();
    router.push('/');
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
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 ease-in-out"
        >
          Logout
        </button>
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
    </main>
  );
}