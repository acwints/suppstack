"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import ProductCard from '../../components/ProductCard';
import type { Supplement, Product } from '@/types';
import { Spinner } from '@/components/ui';

export default function SupplementPage({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const productsPerPage = 15;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const supplementId = parseInt(params.id);

      const [supplementResult, productsResult] = await Promise.all([
        supabase.from('supplements').select('*').eq('supplement_id', supplementId).single(),
        supabase.from('products').select('*, brands(brand_name), supplements(supplement_name)').eq('supplement_id', supplementId).order('product_name', { ascending: true }),
      ]);

      if (supplementResult.error) {
        console.error('Error fetching supplement:', supplementResult.error);
      } else {
        setSupplement(supplementResult.data);
      }

      if (productsResult.error) {
        console.error('Error fetching products:', productsResult.error);
      } else {
        setProducts(productsResult.data || []);
      }

      setIsLoading(false);
    }

    fetchData();
  }, [params.id]);

  const displayedProducts = products.slice(0, currentPage * productsPerPage);

  const loadMoreProducts = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!supplement) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Supplement not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-4 text-gradient">{supplement.supplement_name}</h1>
      <p className="text-xl mb-8 text-gray-700">{supplement.supplement_description}</p>

      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Available Products ({products.length})
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found for this supplement.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          {products.length > displayedProducts.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMoreProducts}
                className="btn btn-primary"
              >
                Load More Products
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
