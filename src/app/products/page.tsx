import { ProductDirectoryClient } from '@/components/composite/Product';
import { buildProductDirectory } from '@/lib/catalog/product-directory';

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { goal?: string };
}) {
  const directory = buildProductDirectory();

  return (
    <main className="min-h-screen bg-white">
      <section className="container-custom py-6 sm:py-8">
        <div className="section-header">
          <h1 className="font-serif text-3xl text-gray-900">All Products</h1>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          {directory.productCount} products from {directory.brandCount} brands
        </p>
        <ProductDirectoryClient
          products={directory.products}
          healthGoals={directory.healthGoals}
          commerceShelves={directory.commerceShelves}
          initialGoalId={searchParams?.goal}
        />
      </section>
    </main>
  );
}
