export type CaptureIntent = 'barcode' | 'photo_label' | 'manual_search';

export interface CaptureResult {
  type: CaptureIntent;
  rawValue: string;
  matchedProductId?: string;
  confidence: number;
  source: 'user' | 'barcode' | 'ocr' | 'catalog';
}
