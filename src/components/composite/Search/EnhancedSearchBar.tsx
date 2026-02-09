'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes, FaHistory, FaArrowRight } from 'react-icons/fa';
import { FiPackage, FiHash } from 'react-icons/fi';
import Link from 'next/link';
import { supabase } from '@/app/supabase';
import { useDebounce } from '@/hooks';
import { cn } from '@/lib/design-system/utils';

export interface EnhancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  type: 'supplement' | 'product' | 'category';
  id: string | number;
  name: string;
  subtitle?: string;
  href: string;
}

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'suppstack_recent_searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string): void {
  if (typeof window === 'undefined' || !term.trim()) return;
  try {
    const recent = getRecentSearches().filter(s => s !== term);
    recent.unshift(term);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {
    // localStorage unavailable
  }
}

function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // localStorage unavailable
  }
}

export function EnhancedSearchBar({
  value,
  onChange,
  placeholder = 'Search supplements, products, brands...',
  className,
}: EnhancedSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(value, 250);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch suggestions when search term changes
  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    async function fetchSuggestions() {
      try {
        const term = debouncedValue.toLowerCase();

        // Fetch supplements and products in parallel
        const [supplementsResult, productsResult] = await Promise.all([
          supabase
            .from('supplements')
            .select('supplement_id, supplement_name, category')
            .or(`supplement_name.ilike.%${term}%,supplement_description.ilike.%${term}%`)
            .limit(5),
          supabase
            .from('products')
            .select('product_id, product_name, brands(brand_name), supplements(supplement_name)')
            .or(`product_name.ilike.%${term}%,product_description.ilike.%${term}%`)
            .limit(5),
        ]);

        if (cancelled) return;

        const supplementSuggestions: SearchSuggestion[] = (supplementsResult.data || []).map(
          (s) => ({
            type: 'supplement' as const,
            id: s.supplement_id,
            name: s.supplement_name,
            subtitle: s.category || 'Supplement',
            href: `/supplement/${s.supplement_id}`,
          })
        );

        const productSuggestions: SearchSuggestion[] = (productsResult.data || []).map(
          (p: any) => ({
            type: 'product' as const,
            id: p.product_id,
            name: p.product_name,
            subtitle: p.brands?.brand_name || p.supplements?.supplement_name || 'Product',
            href: `/product/${p.product_id}`,
          })
        );

        setSuggestions([...supplementSuggestions, ...productSuggestions]);
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
    setRecentSearches(getRecentSearches());
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    saveRecentSearch(suggestion.name);
    onChange(suggestion.name);
    setIsOpen(false);
  };

  const handleRecentSearch = (term: string) => {
    onChange(term);
    setIsOpen(false);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveRecentSearch(value.trim());
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (value ? 0 : recentSearches.length);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      if (value && suggestions[highlightedIndex]) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else if (!value && recentSearches[highlightedIndex]) {
        handleRecentSearch(recentSearches[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = isOpen && (
    (value.length >= 2 && (suggestions.length > 0 || isSearching)) ||
    (!value && recentSearches.length > 0)
  );

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setHighlightedIndex(-1);
            }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full pl-12 pr-10 py-4 text-lg',
              'border border-gray-300 rounded-full',
              'focus:ring-2 focus:ring-gray-200 focus:border-gray-400',
              'bg-white text-gray-900 placeholder-gray-500',
              'focus:outline-none transition-all duration-300',
              'shadow-sm hover:shadow-md',
            )}
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50"
        >
          {/* Recent Searches */}
          {!value && recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recent Searches
                </span>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((term, i) => (
                <button
                  key={term}
                  onClick={() => handleRecentSearch(term)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors',
                    highlightedIndex === i
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  )}
                  role="option"
                  aria-selected={highlightedIndex === i}
                >
                  <FaHistory className="text-gray-400 shrink-0" size={12} />
                  <span className="text-sm text-gray-700 truncate">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {value.length >= 2 && (
            <div className="p-3">
              {isSearching && suggestions.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <div className="inline-block h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">Searching...</p>
                </div>
              )}

              {!isSearching && suggestions.length === 0 && value.length >= 2 && (
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-gray-500">No results for &ldquo;{value}&rdquo;</p>
                </div>
              )}

              {suggestions.length > 0 && (
                <>
                  {/* Supplement results */}
                  {suggestions.filter(s => s.type === 'supplement').length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                        Supplements
                      </span>
                      {suggestions
                        .filter(s => s.type === 'supplement')
                        .map((suggestion, i) => (
                          <Link
                            key={`${suggestion.type}-${suggestion.id}`}
                            href={suggestion.href}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={cn(
                              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors mt-1',
                              highlightedIndex === i
                                ? 'bg-gray-100'
                                : 'hover:bg-gray-50'
                            )}
                            role="option"
                            aria-selected={highlightedIndex === i}
                          >
                            <div className="p-1.5 bg-gray-100 rounded-md">
                              <FiHash className="text-gray-500" size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {suggestion.name}
                              </p>
                              {suggestion.subtitle && (
                                <p className="text-xs text-gray-500 truncate">
                                  {suggestion.subtitle}
                                </p>
                              )}
                            </div>
                            <FaArrowRight className="text-gray-300 shrink-0" size={10} />
                          </Link>
                        ))}
                    </div>
                  )}

                  {/* Product results */}
                  {suggestions.filter(s => s.type === 'product').length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                        Products
                      </span>
                      {suggestions
                        .filter(s => s.type === 'product')
                        .map((suggestion, i) => {
                          const globalIndex = suggestions.filter(s => s.type === 'supplement').length + i;
                          return (
                            <Link
                              key={`${suggestion.type}-${suggestion.id}`}
                              href={suggestion.href}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className={cn(
                                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors mt-1',
                                highlightedIndex === globalIndex
                                  ? 'bg-gray-100'
                                  : 'hover:bg-gray-50'
                              )}
                              role="option"
                              aria-selected={highlightedIndex === globalIndex}
                            >
                              <div className="p-1.5 bg-gray-100 rounded-md">
                                <FiPackage className="text-gray-500" size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {suggestion.name}
                                </p>
                                {suggestion.subtitle && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {suggestion.subtitle}
                                  </p>
                                )}
                              </div>
                              <FaArrowRight className="text-gray-300 shrink-0" size={10} />
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedSearchBar;
