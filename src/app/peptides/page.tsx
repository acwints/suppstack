import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { PeptideExplorer } from '@/components/composite/Supplement/PeptideExplorer';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';

export default function PeptidesPage() {
  const peptideSupplements = supplementCatalog.filter(
    (supplement) =>
      supplement.research_only || supplement.category?.toLowerCase() === 'peptides'
  );

  return (
    <main className="mobile-page bg-white">
      <Link
        href="/"
        className="mb-6 hidden items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 md:inline-flex"
      >
        <FiArrowLeft />
        Back to shop
      </Link>

      <section className="border-b border-gray-200 pb-6">
        <h1 className="font-serif text-4xl leading-tight text-gray-900 sm:text-5xl">
          Peptides
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
          Peptides and prescription-only metabolic compounds live as reference profiles:
          you can add them to a stack for planning, but SuppStack does not sell them or
          route users to purchase them.
        </p>
      </section>

      <section className="pt-6">
        <PeptideExplorer supplements={peptideSupplements} />
      </section>
    </main>
  );
}
