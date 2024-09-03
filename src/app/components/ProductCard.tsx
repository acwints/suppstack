'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import Image from 'next/image';

interface Product {
  product_id: string;
  product_name: string;
  product_description: string;
  product_price: number;
  product_url: string;
  product_image: string;
  brands: { brand_name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const [isAdded, setIsAdded] = useState(false);
  const { user } = useAuth();

  const addToRegimen = async () => {
    if (!user) {
      alert('Please log in to add products to your regimen');
      return;
    }

    const servingsPerDay = prompt('How many servings do you take per day?');
    if (!servingsPerDay) {
      alert('Please provide the number of servings per day.');
      return;
    }

    const servingsPerDayNum = parseFloat(servingsPerDay);
    if (isNaN(servingsPerDayNum)) {
      alert('Please enter a valid number for servings per day.');
      return;
    }

    try {
      const { data: existingProduct, error: checkError } = await supabase
        .from('users_products')
        .select()
        .eq('user_id', user.id)
        .eq('product_id', product.product_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProduct) {
        alert('This product is already in your regimen.');
        setIsAdded(true);
        return;
      }

      const { error: insertError } = await supabase
        .from('users_products')
        .insert({
          user_id: user.id,
          product_id: product.product_id,
          servings_per_day: servingsPerDayNum,
        });

      if (insertError) {
        if (insertError.code === '42501') {
          console.error('RLS policy violation:', insertError);
          alert('You do not have permission to add this product to your regimen.');
        } else {
          throw insertError;
        }
        return;
      }

      setIsAdded(true);
      alert('Product added to your regimen!');
    } catch (error) {
      console.error('Error adding product to regimen:', error);
      alert('Failed to add product to regimen. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
      <div className="mb-4">
        <Image
          src={product.product_image}
          alt={product.product_name}
          width={200}
          height={200}
          className="w-full h-48 object-cover rounded-md"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-blue-600">{product.product_name}</h3>
      <p className="text-gray-600 mb-4">{product.product_description}</p>
      <p className="text-lg font-bold mb-4 text-blue-600">${product.product_price.toFixed(2)}</p>
      <p className="text-sm text-gray-500 mb-4">Brand: {product.brands.brand_name}</p>
      <div className="flex justify-between">
        <button
          onClick={addToRegimen}
          className={`px-4 py-2 rounded transition duration-300 ${
            isAdded ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isAdded}
        >
          {isAdded ? 'Added to Regimen' : 'Add to Regimen'}
        </button>
        <a
          href={product.product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300"
        >
          Shop Now
        </a>
      </div>
    </div>
  );
}
