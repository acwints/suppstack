import type { Product } from '@/types';

export type CounterScanMatchStatus = 'matched' | 'ambiguous' | 'unmatched';
export type CounterScanMode = 'ai' | 'text';

export interface CounterScanRecognizedInput {
  label: string;
  brandName: string;
  productName: string;
  supplementName: string;
  confidence: number;
  visibleText: string[];
  visualCues: string;
}

export interface CounterScanMatchedItem extends CounterScanRecognizedInput {
  id: string;
  query: string;
  matchStatus: CounterScanMatchStatus;
  matchConfidence: number;
  product: Product | null;
  alternates: Product[];
}

export interface CounterScanApiResponse {
  mode: CounterScanMode;
  scannedAt: string;
  matchedCount: number;
  unresolvedCount: number;
  items: CounterScanMatchedItem[];
}

export interface CounterScanApiError {
  code:
    | 'AUTH_REQUIRED'
    | 'NATIVE_APP_REQUIRED'
    | 'AI_NOT_CONFIGURED'
    | 'INVALID_IMAGE'
    | 'IMAGE_TOO_LARGE'
    | 'SCAN_FAILED';
  error: string;
}
