"use client";

import { supabase } from './supabase';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Supplement {
  supplement_id: number;
  supplement_name: string;
  supplement_description: string;
}

function truncateDescription(description: string, maxLength: number): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.slice(0, maxLength).trim() + '...';
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Popular Supplements</h1>
      <SupplementList />
    </div>
  );
}

function SupplementList() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);

  useEffect(() => {
    async function fetchSupplements() {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .order('supplement_name', { ascending: true });

      if (error) {
        console.error('Error fetching supplements:', error);
      } else {
        setSupplements(data);
      }
    }

    fetchSupplements();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {supplements.map((supplement) => (
        <Link href={`/supplement/${supplement.supplement_id}`} key={supplement.supplement_id}>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <h2 className="text-2xl font-semibold mb-2">{supplement.supplement_name}</h2>
            <p className="text-gray-600">{truncateDescription(supplement.supplement_description, 200)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
