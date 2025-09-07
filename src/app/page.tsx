'use client';
import { useLiffCtx } from './liff/liff-provider';
import TopPage from '@/components/TopPage';

export default function Page() {
  const { ready, mock, error, profile } = useLiffCtx();
  if (error) return <pre>LIFF Error: {error}</pre>;
  return <TopPage />;
}
