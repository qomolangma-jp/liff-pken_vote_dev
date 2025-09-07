// src/app/local/page.tsx
import TopPage from "@/components/TopPage";
import { useLineUser } from "@/hooks/useLineUser";

export default function LocalTopPage() {
  const { user, loading } = useLineUser();
  if (loading) return <main>読み込み中...</main>;
  if (!user) return <main>ログイン情報がありません。</main>;
  return <TopPage />;
}
