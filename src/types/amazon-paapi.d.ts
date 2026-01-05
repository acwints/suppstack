// Type declarations for optional amazon-paapi package
// This file allows TypeScript to compile even when the package isn't installed

declare module 'amazon-paapi' {
  interface SearchItemsParams {
    AccessKey: string;
    SecretKey: string;
    PartnerTag: string;
    PartnerType: string;
    Marketplace?: string;
    Keywords: string;
    SearchIndex: string;
    ItemPage?: number;
    ItemCount?: number;
    Resources: string[];
  }

  interface GetItemsParams {
    AccessKey: string;
    SecretKey: string;
    PartnerTag: string;
    PartnerType: string;
    Marketplace?: string;
    ItemIds: string[];
    Resources: string[];
  }

  interface ItemResult {
    ASIN: string;
    ItemInfo?: {
      Title?: { DisplayValue?: string };
      Features?: { DisplayValues?: string[] };
      ByLineInfo?: { Brand?: { DisplayValue?: string } };
    };
    Offers?: {
      Listings?: Array<{
        Price?: {
          Amount?: number;
          Currency?: string;
          DisplayAmount?: string;
        };
      }>;
    };
    Images?: {
      Primary?: { Large?: { URL?: string } };
      Variants?: Array<{ Large?: { URL?: string } }>;
    };
    CustomerReviews?: {
      StarRating?: { Value?: number };
      Count?: number;
    };
    DetailPageURL?: string;
  }

  interface SearchItemsResponse {
    SearchResult?: {
      Items?: ItemResult[];
      TotalResultCount?: number;
    };
    Errors?: Array<{ Message: string }>;
  }

  interface GetItemsResponse {
    ItemsResult?: {
      Items?: ItemResult[];
    };
    Errors?: Array<{ Message: string }>;
  }

  const amazonPaapi: {
    SearchItems: (params: SearchItemsParams) => Promise<SearchItemsResponse>;
    GetItems: (params: GetItemsParams) => Promise<GetItemsResponse>;
  };

  export default amazonPaapi;
}
