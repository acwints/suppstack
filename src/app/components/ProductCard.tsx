'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import Image from 'next/image';
import { FaPlus, FaStar, FaCheck, FaShoppingCart, FaHeart, FaShareAlt } from 'react-icons/fa';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  // Calculate cost per serving
  const costPerServing = product.servings_per_container > 0 
    ? (product.product_price / product.servings_per_container).toFixed(2)
    : '0.00';

  const monthlyCost = product.servings_per_day > 0 
    ? (parseFloat(costPerServing) * product.servings_per_day * 30).toFixed(2)
    : '0.00';

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

  const addToStack = async () => {
    if (!user) {
      alert('Please log in to add products to your stack');
      return;
    }

    setIsLoading(true);
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
        throw insertError;
      }

      setIsAdded(true);
    } catch (error) {
      console.error('Error adding product to stack:', error);
      alert('Failed to add product to stack. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRating = () => {
    // Generate consistent rating based on product name hash
    const hash = product.product_name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 4.0 + (Math.abs(hash) % 10) / 10; // Rating between 4.0-4.9
  };

  const rating = generateRating();
  const reviewCount = Math.floor(Math.abs(rating * 100)) + 50;

  return (
    <div 
      className="card group hover:scale-105 transition-all duration-300 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden rounded-t-xl">
        {product.product_image ? (
          <Image
            src={product.product_image}
            alt={product.product_name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center shadow-medium">
              <span className="text-2xl font-bold text-primary-600">
                {product.product_name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-secondary">
            Best Seller
          </span>
        </div>
        
        {/* Quick Actions */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-medium hover:bg-neutral-50 transition-colors duration-200">
            <FaHeart className="w-3 h-3 text-neutral-600" />
          </button>
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-medium hover:bg-neutral-50 transition-colors duration-200">
            <FaShareAlt className="w-3 h-3 text-neutral-600" />
          </button>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 bg-primary-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-medium">
          ${product.product_price?.toFixed(2) ?? '0.00'}
        </div>
      </div>

      {/* Product Details */}
      <div className="card-body">
        {/* Brand */}
        <div className="text-sm text-primary-600 font-semibold mb-2">
          {product.brands?.brand_name || 'Premium Brand'}
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg mb-3 text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.product_name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-accent-400' : 'text-neutral-200'}`} 
              />
            ))}
          </div>
          <span className="text-sm text-neutral-600 font-medium">
            {rating.toFixed(1)} ({reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Product Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100">
            <div className="font-bold text-neutral-900">${costPerServing}</div>
            <div className="text-neutral-600">per serving</div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100">
            <div className="font-bold text-neutral-900">${monthlyCost}</div>
            <div className="text-neutral-600">per month</div>
          </div>
        </div>

        {/* Serving Info */}
        <div className="text-xs text-neutral-500 mb-4 font-medium">
          {product.servings_per_container} servings • {product.servings_per_day} per day recommended
        </div>

        {/* Add to Stack Button */}
        <button
          onClick={addToStack}
          disabled={isAdded || isLoading}
          className={`btn w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            isAdded 
              ? 'bg-success-50 text-success-700 border border-success-200 hover:bg-success-100' 
              : 'btn-primary'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isAdded ? (
            <>
              <FaCheck className="w-4 h-4" />
              Added to Stack
            </>
          ) : (
            <>
              <FaShoppingCart className="w-4 h-4" />
              Add to My Stack
            </>
          )}
        </button>

        {/* Purchase Links */}
        <div className="flex gap-2 mt-3">
          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline flex-1 py-2 px-3 text-xs text-center rounded-xl transition-colors"
            >
              Official Store
            </a>
          )}
          {product.amazon_url && (
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 text-xs text-center bg-accent-400 hover:bg-accent-500 text-white rounded-xl transition-colors font-semibold"
            >
              Amazon
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
