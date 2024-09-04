'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import Image from 'next/image';
import { FaPlus } from 'react-icons/fa';
import { useEffect } from 'react';

interface Product {
  product_id: string;
  product_name: string;
  product_description: string;
  product_price: number;
  product_url: string;
  amazon_url: string;
  product_image: string;
  servings_per_container: number;
  servings_per_day: number;
  brands: { brand_name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const [isAdded, setIsAdded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkIfAdded = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users_products')
          .select()
          .eq('user_id', user.id)
          .eq('product_id', product.product_id)
          .single();

        if (data && !error) {
          setIsAdded(true);
        }
      }
    };

    checkIfAdded();
  }, [user, product.product_id]);

  const addToRegimen = async () => {
    if (!user) {
      alert('Please log in to add products to your regimen');
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 relative">
      <div className="absolute top-4 left-4 z-10">
        <p className="text-lg font-bold text-blue-600">${product.product_price?.toFixed(2) ?? 'N/A'}</p>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={addToRegimen}
          className={`px-3 py-2 rounded text-sm transition duration-300 flex items-center ${
            isAdded ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isAdded}
        >
          {!isAdded && <FaPlus className="mr-1 h-3 w-3" />}
          {isAdded ? 'Added' : 'Add to Stack'}
        </button>
      </div>
      <div className="mb-4">
        {product.product_image && (
          <Image
            src={product.product_image}
            alt={product.product_name || 'Product image'}
            width={200}
            height={200}
            className="w-full h-48 object-contain rounded-md"
          />
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1 font-semibold">{product.brands?.brand_name || 'Unknown Brand'}</p>
      <h3 className="text-xl font-semibold mb-2 text-blue-600">{product.product_name || 'Unnamed Product'}</h3>
      <div className="flex justify-between">
        {product.product_url && (
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Buy on Website
          </a>
        )}
        {product.amazon_url && (
          <a
            href={product.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition duration-300"
          >
            Buy on Amazon
          </a>
        )}
      </div>
    </div>
  );
}
