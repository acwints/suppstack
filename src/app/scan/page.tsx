import type { Metadata } from 'next';
import { CounterScanClient } from '@/components/composite/Scan';

export const metadata: Metadata = {
  title: 'Counter Scan | SuppStack AI',
  description: 'Scan supplement bottles, review canonical product matches, and add them to your SuppStack.',
};

export default function CounterScanPage() {
  return <CounterScanClient />;
}
