import type { Metadata } from 'next';
import { CounterScanClient } from '@/components/composite/Scan';

export const metadata: Metadata = {
  title: 'Scan Your Stack | SuppStack AI',
  description: 'Scan supplement bottles in the SuppStack mobile app, review canonical product matches, and add them to your stack.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CounterScanPage() {
  return <CounterScanClient />;
}
