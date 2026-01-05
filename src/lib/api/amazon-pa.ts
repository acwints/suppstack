/**
 * Amazon Product Advertising API Client
 *
 * SETUP REQUIRED:
 * 1. Create Amazon Associates account: https://affiliate-program.amazon.com/
 * 2. Apply for Product Advertising API access
 * 3. Add credentials to .env.local:
 *    - AMAZON_PA_ACCESS_KEY
 *    - AMAZON_PA_SECRET_KEY
 *    - AMAZON_PA_PARTNER_TAG
 * 4. npm install amazon-paapi (optional - API will return empty results if not installed)
 *
 * Types are declared in /src/types/amazon-paapi.d.ts
 */

export interface AmazonProduct {
  asin: string;
  title: string;
  description?: string;
  features?: string[];
  price?: {
    amount: number;
    currency: string;
    displayAmount: string;
  };
  images?: {
    primary?: string;
    variants?: string[];
  };
  rating?: number;
  reviewCount?: number;
  brand?: string;
  url?: string;
}

export interface SearchParams {
  keywords: string;
  category?: string;
  page?: number;
}

export interface SearchResult {
  products: AmazonProduct[];
  totalResults: number;
}

class AmazonPAClient {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private region: string;
  private host: string;

  constructor() {
    this.accessKey = process.env.AMAZON_PA_ACCESS_KEY || '';
    this.secretKey = process.env.AMAZON_PA_SECRET_KEY || '';
    this.partnerTag = process.env.AMAZON_PA_PARTNER_TAG || '';
    this.region = process.env.AMAZON_PA_REGION || 'us-east-1';
    this.host = 'webservices.amazon.com';
  }

  isConfigured(): boolean {
    return !!(this.accessKey && this.secretKey && this.partnerTag);
  }

  async searchProducts(params: SearchParams): Promise<SearchResult> {
    if (!this.isConfigured()) {
      console.warn('Amazon PA API not configured');
      return { products: [], totalResults: 0 };
    }

    // Implementation requires AWS4 signing - use amazon-paapi package in production
    // npm install amazon-paapi
    try {
      const amazonPaapi = await import('amazon-paapi').catch(() => null);
      if (!amazonPaapi) {
        console.warn('amazon-paapi package not installed');
        return { products: [], totalResults: 0 };
      }

      const response = await amazonPaapi.default.SearchItems({
        AccessKey: this.accessKey,
        SecretKey: this.secretKey,
        PartnerTag: this.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        Keywords: params.keywords,
        SearchIndex: params.category || 'HealthPersonalCare',
        ItemCount: 10,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
        ],
      });

      return {
        products: (response.SearchResult?.Items || []).map(this.parseItem),
        totalResults: response.SearchResult?.TotalResultCount || 0,
      };
    } catch (error) {
      console.error('Amazon PA API error:', error);
      return { products: [], totalResults: 0 };
    }
  }

  async getProductByASIN(asin: string): Promise<AmazonProduct | null> {
    if (!this.isConfigured()) return null;

    try {
      const amazonPaapi = await import('amazon-paapi').catch(() => null);
      if (!amazonPaapi) return null;

      const response = await amazonPaapi.default.GetItems({
        AccessKey: this.accessKey,
        SecretKey: this.secretKey,
        PartnerTag: this.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        ItemIds: [asin],
        Resources: [
          'Images.Primary.Large',
          'Images.Variants.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ByLineInfo',
          'Offers.Listings.Price',
        ],
      });

      const item = response.ItemsResult?.Items?.[0];
      return item ? this.parseItem(item) : null;
    } catch (error) {
      console.error('Amazon PA API error:', error);
      return null;
    }
  }

  private parseItem(item: any): AmazonProduct {
    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || '',
      features: item.ItemInfo?.Features?.DisplayValues,
      price: item.Offers?.Listings?.[0]?.Price ? {
        amount: item.Offers.Listings[0].Price.Amount,
        currency: item.Offers.Listings[0].Price.Currency,
        displayAmount: item.Offers.Listings[0].Price.DisplayAmount,
      } : undefined,
      images: {
        primary: item.Images?.Primary?.Large?.URL,
        variants: item.Images?.Variants?.map((v: any) => v.Large?.URL).filter(Boolean),
      },
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
      url: item.DetailPageURL,
    };
  }
}

export const amazonPA = new AmazonPAClient();
export default amazonPA;
