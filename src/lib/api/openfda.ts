/**
 * OpenFDA Dietary Supplements API Client
 * Free API - no key required for basic usage (rate limited to 40 requests/minute)
 *
 * API Documentation: https://open.fda.gov/apis/
 */

const BASE_URL = 'https://api.fda.gov';

export interface SupplementLabel {
  id: string;
  productName: string;
  manufacturer?: string;
  servingSize?: string;
  ingredients?: string[];
  warnings?: string[];
  directions?: string;
}

export interface SearchResult {
  results: SupplementLabel[];
  total: number;
}

class OpenFDAClient {
  private apiKey: string | null;

  constructor() {
    // Optional API key for higher rate limits
    this.apiKey = process.env.OPENFDA_API_KEY || null;
  }

  /**
   * Search dietary supplement labels
   */
  async searchSupplements(query: string, limit: number = 10): Promise<SearchResult> {
    try {
      const searchQuery = encodeURIComponent(`"${query}"`);
      const url = new URL(`${BASE_URL}/food/label.json`);
      url.searchParams.set('search', `products.product_name:${searchQuery}`);
      url.searchParams.set('limit', limit.toString());

      if (this.apiKey) {
        url.searchParams.set('api_key', this.apiKey);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 404) {
          return { results: [], total: 0 };
        }
        throw new Error(`OpenFDA API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        results: (data.results || []).map(this.parseLabel),
        total: data.meta?.results?.total || 0,
      };
    } catch (error) {
      console.error('OpenFDA API error:', error);
      return { results: [], total: 0 };
    }
  }

  /**
   * Search for supplement facts/ingredients
   */
  async getSupplementFacts(productName: string, brand?: string): Promise<SupplementLabel | null> {
    try {
      let searchQuery = `products.product_name:"${productName}"`;
      if (brand) {
        searchQuery += ` AND products.brand_name:"${brand}"`;
      }

      const url = new URL(`${BASE_URL}/food/label.json`);
      url.searchParams.set('search', searchQuery);
      url.searchParams.set('limit', '1');

      if (this.apiKey) {
        url.searchParams.set('api_key', this.apiKey);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const result = data.results?.[0];

      return result ? this.parseLabel(result) : null;
    } catch (error) {
      console.error('OpenFDA API error:', error);
      return null;
    }
  }

  /**
   * Search drug labels (for vitamin/mineral products that are classified as drugs)
   */
  async searchDrugLabels(query: string, limit: number = 10): Promise<SearchResult> {
    try {
      const url = new URL(`${BASE_URL}/drug/label.json`);
      url.searchParams.set('search', `openfda.brand_name:"${query}"+purpose:"dietary supplement"`);
      url.searchParams.set('limit', limit.toString());

      if (this.apiKey) {
        url.searchParams.set('api_key', this.apiKey);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        return { results: [], total: 0 };
      }

      const data = await response.json();

      return {
        results: (data.results || []).map(this.parseDrugLabel),
        total: data.meta?.results?.total || 0,
      };
    } catch (error) {
      console.error('OpenFDA API error:', error);
      return { results: [], total: 0 };
    }
  }

  private parseLabel(item: any): SupplementLabel {
    const product = item.products?.[0] || {};

    return {
      id: item.fda_id || item.report_id || '',
      productName: product.product_name || item.food_name || '',
      manufacturer: product.manufacturer_name || item.company || '',
      servingSize: item.serving_size || '',
      ingredients: this.parseIngredients(item.ingredients || ''),
      warnings: item.caution_statement ? [item.caution_statement] : [],
      directions: item.directions || '',
    };
  }

  private parseDrugLabel(item: any): SupplementLabel {
    return {
      id: item.id || item.set_id || '',
      productName: item.openfda?.brand_name?.[0] || '',
      manufacturer: item.openfda?.manufacturer_name?.[0] || '',
      ingredients: item.active_ingredient || [],
      warnings: item.warnings || [],
      directions: item.dosage_and_administration?.[0] || '',
    };
  }

  private parseIngredients(ingredientsStr: string): string[] {
    if (!ingredientsStr) return [];

    // Split by common delimiters and clean up
    return ingredientsStr
      .split(/[,;]/)
      .map(i => i.trim())
      .filter(i => i.length > 0 && i.length < 100);
  }
}

export const openFDA = new OpenFDAClient();
export default openFDA;
