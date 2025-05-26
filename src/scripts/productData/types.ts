export interface SupplementMap {
  get(key: string): number | undefined;
}

export interface BrandMap {
  get(key: string): number | undefined;
}

export interface Product {
  product_name: string;
  product_description: string;
  product_price: number;
  product_url: string;
  amazon_url: string;
  product_image: string;
  servings_per_container: number;
  servings_per_day: number;
  supplement_id: number | undefined;
  brand_id: number | undefined;
}
