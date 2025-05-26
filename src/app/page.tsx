"use client";

import { supabase } from './supabase';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaStar, FaShoppingCart, FaRocket, FaBolt, FaAtom } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';
import FeaturedStacks from './components/FeaturedStacks';

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
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 text-gray-900 leading-tight">
              <span className="inline-block animate-slide-up">Find Your</span>
              <br />
              <span className="inline-block text-gradient animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Perfect Supplements
              </span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-gray-600 leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Discover science-backed supplements recommended by health professionals and trusted by thousands.
            </p>
            <div className="max-w-2xl mx-auto animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{supplements.length}+</div>
                <div className="text-sm text-gray-500">Supplements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">25K+</div>
                <div className="text-sm text-gray-500">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">4.9★</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/95">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <CategoryFilter 
                supplements={supplements}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
            <div className="flex items-center gap-6">
              <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
              <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                {sortedSupplements.length} supplements found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        {loading ? (
          <LoadingGrid />
        ) : (
          <>
            {/* Featured Stacks */}
            <FeaturedStacks />
            
            {/* Featured Categories */}
            <FeaturedCategories supplements={supplements} />
            
            {/* Product Grid */}
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Premium <span className="text-gradient">Supplements</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Discover high-quality supplements trusted by health professionals and backed by science
                </p>
              </div>
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
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
        <FaSearch className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search supplements, vitamins, minerals..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-14 pr-6 py-4 text-lg bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 focus:outline-none transition-all duration-300 hover:border-gray-400 shadow-sm hover:shadow-md"
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
    { id: 'all', name: 'All Supplements', count: supplements.length, icon: '🌟' },
    { id: 'vitamins', name: 'Vitamins', count: supplements.filter(s => s.supplement_name.toLowerCase().includes('vitamin')).length, icon: '💊' },
    { id: 'minerals', name: 'Minerals', count: supplements.filter(s => ['magnesium', 'zinc', 'calcium', 'iron'].some(m => s.supplement_name.toLowerCase().includes(m))).length, icon: '⚡' },
    { id: 'protein', name: 'Protein', count: supplements.filter(s => s.supplement_name.toLowerCase().includes('protein')).length, icon: '💪' },
    { id: 'herbs', name: 'Herbs', count: supplements.filter(s => ['ashwagandha', 'turmeric'].some(h => s.supplement_name.toLowerCase().includes(h))).length, icon: '🌿' },
  ];

  return (
    <div className="flex items-center gap-3">
      <FaFilter className="text-gray-400" />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 focus:outline-none"
      >
        {categories.map(category => (
          <option key={category.id} value={category.id} className="bg-white">
            {category.icon} {category.name} ({category.count})
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
      className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 focus:outline-none"
    >
      <option value="name" className="bg-white">Sort by Name</option>
      <option value="popular" className="bg-white">Most Popular</option>
      <option value="newest" className="bg-white">Newest First</option>
    </select>
  );
}

function FeaturedCategories({ supplements }: { supplements: Supplement[] }) {
  const featuredCategories = [
    {
      name: 'Daily Essentials',
      description: 'Core vitamins for optimal health',
      supplements: supplements.filter(s => 
        ['vitamin d3', 'vitamin c', 'vitamin b12', 'b-complex'].some(v => 
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      gradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      icon: <FaAtom className="text-4xl mb-4 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
    },
    {
      name: 'Performance',
      description: 'Peak physical performance enhancers',
      supplements: supplements.filter(s => 
        ['protein', 'creatine', 'omega-3'].some(v => 
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      gradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      icon: <FaBolt className="text-4xl mb-4 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
    },
    {
      name: 'Cognitive',
      description: 'Brain health and mental clarity',
      supplements: supplements.filter(s => 
        ['ashwagandha', 'magnesium', 'omega-3'].some(v => 
          s.supplement_name.toLowerCase().includes(v)
        )
      ).slice(0, 4),
      gradient: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      icon: <FaRocket className="text-4xl mb-4 text-yellow-600 group-hover:translate-y-[-4px] transition-transform duration-300" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {featuredCategories.map((category, index) => (
        <div 
          key={index} 
          className={`feature-highlight bg-gradient-to-br ${category.gradient} border ${category.borderColor} rounded-xl p-8 text-gray-900 group cursor-pointer airbnb-hover`}
          style={{ 
            animationDelay: `${index * 0.2}s`
          }}
        >
          <div className="flex justify-center">
            {category.icon}
          </div>
          <h3 className="text-2xl font-bold mb-3 text-center text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">{category.description}</p>
          <div className="space-y-2">
            {category.supplements.slice(0, 3).map(supplement => (
              <Link 
                key={supplement.supplement_id}
                href={`/supplement/${supplement.supplement_id}`}
                className="block text-sm text-gray-700 hover:text-orange-600 transition-all duration-200 px-2 py-1 rounded hover:bg-white/60"
              >
                → {supplement.supplement_name}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {supplements.map((supplement, index) => (
        <SupplementCard 
          key={supplement.supplement_id} 
          supplement={supplement} 
          index={index}
        />
      ))}
    </div>
  );
}

function SupplementCard({ supplement, index }: { supplement: Supplement; index: number }) {
  return (
    <Link href={`/supplement/${supplement.supplement_id}`}>
      <div 
        className="modern-card group animate-fade-in airbnb-hover"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Image placeholder with gradient */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden rounded-t-xl border-b border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300">
            <span className="text-2xl font-bold text-white">
              {supplement.supplement_name.charAt(0)}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="badge badge-primary">
              Verified
            </span>
          </div>
        </div>
        
        <div className="card-body">
          <h3 className="font-bold text-lg mb-3 text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {supplement.supplement_name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {supplement.supplement_description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-3 h-3 text-yellow-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1 font-medium">4.8</span>
            </div>
                          <div className="text-sm font-semibold text-orange-600 flex items-center gap-1 group-hover:text-orange-700">
              Learn more 
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="modern-card animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-xl"></div>
          <div className="card-body">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
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
