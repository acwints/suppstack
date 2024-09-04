"use client";

import { supabase } from '../../supabase';
import ProductCard from '../../components/ProductCard';
import { useState, useEffect } from 'react';

interface Supplement {
  supplement_id: string;
  supplement_name: string;
  supplement_description: string;
}

interface Product {
  product_id: string;
  product_name: string;
  product_description: string;
  product_price: number;
  brands: { brand_name: string };
  product_url: string;
  product_image: string;
  supplement_id: string;
  amazon_url: string;
  servings_per_container: number;
  servings_per_day: number;
}

export default function SupplementPage({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const productsPerPage = 15;

  useEffect(() => {
    async function fetchData() {
      const supplementId = parseInt(params.id);
      const [{ data: supplementData, error: supplementError }, { data: productsData, error: productsError }] = await Promise.all([
        supabase.from('supplements').select('*').eq('supplement_id', supplementId).single(),
        supabase.from('products').select('*, brands(*)').eq('supplement_id', supplementId).order('product_name', { ascending: true }),
      ]);

      if (supplementError) {
        console.error('Error fetching supplement:', supplementError);
      } else {
        setSupplement(supplementData);
      }

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }
    }

    fetchData();
  }, [params.id]);

  const displayedProducts = products.slice(0, currentPage * productsPerPage);

  const loadMoreProducts = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  if (!supplement) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">{supplement.supplement_name}</h1>
      <p className="text-xl mb-8 text-gray-700">{supplement.supplement_description}</p>
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Available Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map((product: Product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
      {products.length > displayedProducts.length && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={loadMoreProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
