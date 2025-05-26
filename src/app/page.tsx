"use client";

import { supabase } from './supabase';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaStar, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

interface Supplement {
  supplement_id: number;
  supplement_name: string;
  supplement_description: string;
}

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
  supplement_id: number;
  brands: { brand_name: string };
  supplements: { supplement_name: string };
}

export default function Home() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch supplements and products
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [supplementsResult, productsResult] = await Promise.all([
          supabase.from('supplements').select('*').order('supplement_name'),
          supabase.from('products').select(`
            *,
            brands(brand_name),
            supplements(supplement_name)
          `).order('product_name')
        ]);

        if (supplementsResult.data) setSupplements(supplementsResult.data);
        if (productsResult.data) setProducts(productsResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort logic
  const filteredSupplements = supplements.filter(supplement => {
    const matchesSearch = supplement.supplement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplement.supplement_description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedSupplements = [...filteredSupplements].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.supplement_name.localeCompare(b.supplement_name);
      case 'popular':
        return Math.random() - 0.5; // Random for now, could be based on user count
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Discover Your Perfect Supplement Stack
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find the best supplements for your health goals with our comprehensive database of products and expert recommendations.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <CategoryFilter 
                supplements={supplements}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
            <div className="flex items-center gap-4">
              <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
              <div className="text-sm text-gray-600">
                {sortedSupplements.length} supplements found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <LoadingGrid />
        ) : (
          <>
            {/* Featured Categories */}
            <FeaturedCategories supplements={supplements} />
            
            {/* Product Grid */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8">Popular Supplements</h2>
              <SupplementGrid supplements={sortedSupplements} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchBar({ searchTerm, setSearchTerm }: { 
  searchTerm: string; 
  setSearchTerm: (term: string) => void; 
}) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search supplements, vitamins, protein..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
      />
    </div>
  );
}

function CategoryFilter({ 
  supplements, 
  selectedCategory, 
  setSelectedCategory 
}: {
  supplements: Supplement[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}) {
  const categories = [
    { id: 'all', name: 'All Supplements', count: supplements.length },
    { id: 'vitamins', name: 'Vitamins', count: supplements.filter(s => s.supplement_name.toLowerCase().includes('vitamin')).length },
    { id: 'minerals', name: 'Minerals', count: supplements.filter(s => ['magnesium', 'zinc', 'calcium', 'iron'].some(m => s.supplement_name.toLowerCase().includes(m))).length },
    { id: 'protein', name: 'Protein', count: supplements.filter(s => s.supplement_name.toLowerCase().includes('protein')).length },
    { id: 'herbs', name: 'Herbs', count: supplements.filter(s => ['ashwagandha', 'turmeric'].some(h => s.supplement_name.toLowerCase().includes(h))).length },
  ];

  return (
    <div className="flex items-center gap-2">
      <FaFilter className="text-gray-500" />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name} ({category.count})
          </option>
        ))}
      </select>
    </div>
  );
}

function SortFilter({ sortBy, setSortBy }: { 
  sortBy: string; 
  setSortBy: (sort: string) => void; 
}) {
  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="name">Sort by Name</option>
      <option value="popular">Most Popular</option>
      <option value="newest">Newest First</option>
    </select>
  );
}

function FeaturedCategories({ supplements }: { supplements: Supplement[] }) {
  const featuredCategories = [
    {
      name: 'Essential Vitamins',
      description: 'Core vitamins for daily health',
      supplements: supplements.filter(s => 
        ['vitamin d3', 'vitamin c', 'vitamin b12', 'b-complex'].some(v => 
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'Fitness & Performance',
      description: 'Boost your workout results',
      supplements: supplements.filter(s => 
        ['protein', 'creatine', 'omega-3'].some(v => 
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      color: 'from-green-400 to-blue-500'
    },
    {
      name: 'Mental Wellness',
      description: 'Support cognitive health',
      supplements: supplements.filter(s => 
        ['ashwagandha', 'magnesium', 'omega-3'].some(v => 
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {featuredCategories.map((category, index) => (
        <div key={index} className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-white`}>
          <h3 className="text-xl font-bold mb-2">{category.name}</h3>
          <p className="text-sm opacity-90 mb-4">{category.description}</p>
          <div className="space-y-2">
            {category.supplements.slice(0, 3).map(supplement => (
              <Link 
                key={supplement.supplement_id}
                href={`/supplement/${supplement.supplement_id}`}
                className="block text-sm hover:underline opacity-90 hover:opacity-100"
              >
                • {supplement.supplement_name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SupplementGrid({ supplements }: { supplements: Supplement[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {supplements.map((supplement) => (
        <SupplementCard key={supplement.supplement_id} supplement={supplement} />
      ))}
    </div>
  );
}

function SupplementCard({ supplement }: { supplement: Supplement }) {
  return (
    <Link href={`/supplement/${supplement.supplement_id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 group">
        {/* Image placeholder with gradient */}
        <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl font-bold text-blue-600">
              {supplement.supplement_name.charAt(0)}
            </span>
          </div>
          <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-600">
            Popular
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
            {supplement.supplement_name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {supplement.supplement_description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-3 h-3 text-yellow-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1">4.8</span>
            </div>
            <div className="text-sm font-semibold text-green-600">
              View Products →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
