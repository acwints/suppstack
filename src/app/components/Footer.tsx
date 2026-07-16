'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isNativeApp } from '@/lib/native/capacitor';

export default function Footer() {
  const pathname = usePathname();
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isNativeApp());
  }, []);

  // The auth screen is a full-bleed experience — no app chrome.
  // The native shell has its own app navigation; never show the website footer there.
  if (pathname === '/login' || isNative) return null;

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white px-4 py-6 text-gray-600 md:p-8">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-start">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-gray-900">SuppStack AI</span>. 
              Health and wellness supplement marketplace.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <a href="/premium" className="hover:text-gray-900 transition-colors duration-200">Premium</a>
            <a href="/privacy" className="hover:text-gray-900 transition-colors duration-200">Privacy</a>
            <a href="/terms" className="hover:text-gray-900 transition-colors duration-200">Terms</a>
            <a href="mailto:support@suppstack.com" className="hover:text-gray-900 transition-colors duration-200">Support</a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="mx-auto max-w-[65ch] text-xs text-gray-500">
            Compare vitamins, minerals, herbs, protein, and everyday wellness products with verified checkout.
          </p>
        </div>
      </div>
    </footer>
  );
}
