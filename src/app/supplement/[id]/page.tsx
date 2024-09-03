import { supabase } from '../../supabase';
import ProductCard from '../../components/ProductCard';

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
}

export default async function SupplementPage({ params }: { params: { id: string } }) {
  const supplementId = parseInt(params.id);

  const [{ data: supplement, error: supplementError }, { data: allProducts, error: productsError }] = await Promise.all([
    supabase.from('supplements').select('*').eq('supplement_id', supplementId).single(),
    supabase.from('products').select('*, brands(*)').eq('supplement_id', supplementId).order('product_name', { ascending: true }),
  ]);

  if (supplementError || productsError) {
    console.error('Error fetching data:', supplementError || productsError);
    return <div>Error loading supplement information</div>;
  }

  if (!supplement || !allProducts) {
    return <div>No data found for this supplement</div>;
  }

  const products = allProducts.filter((product: Product) => parseInt(product.supplement_id) === supplementId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">{supplement.supplement_name}</h1>
      <p className="text-xl mb-8 text-gray-700">{supplement.supplement_description}</p>
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Available Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product: Product) => (
            <ProductCard key={product.product_id} product={product} />
          ))
        ) : (
          <p className="text-gray-600">No products available for this supplement.</p>
        )}
      </div>
    </div>
  );
}
