'use client';
import { useLiffCtx } from './liff/liff-provider';
import TopPage from '@/components/TopPage';

export default function Page() {
  const { ready, mock, error, profile } = useLiffCtx();
  if (error) return <pre>LIFF Error: {error}</pre>;
  if (!ready) return <p>Loading...</p>;

  // モック時は TopPage をそのまま表示
  if (mock) return <TopPage />;

  // 本番（LIFF経由時）は挨拶など
  return <div>こんにちは、{profile?.displayName} さん</div>;
}
