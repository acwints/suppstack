import { ProductDirectoryClient } from '@/components/composite/Product';
import { buildProductDirectory } from '@/lib/catalog/product-directory';

export default async function ProductsPage(
  props: {
    searchParams?: Promise<{
      q?: string;
      goal?: string;
      category?: string;
      brand?: string;
      sort?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const directory = buildProductDirectory();

  return (
    <main className="min-h-screen bg-white">
      <section className="container-custom py-4 lg:py-8">
        <div className="sr-only lg:not-sr-only lg:mb-4 lg:border-b lg:border-gray-200 lg:pb-3">
          <h1 className="font-serif text-3xl text-gray-900">All Products</h1>
        </div>
        <p className="mb-6 hidden text-sm text-gray-500 lg:block">
          {directory.productCount} products from {directory.brandCount} brands
        </p>
        <ProductDirectoryClient
          products={directory.products}
          healthGoals={directory.healthGoals}
          commerceShelves={directory.commerceShelves}
          initialSearchTerm={searchParams?.q}
          initialGoalId={searchParams?.goal}
          initialCategory={searchParams?.category}
          initialBrand={searchParams?.brand}
          initialSortBy={searchParams?.sort}
        />
      </section>
    </main>
  );
}
