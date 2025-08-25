import { useEffect, useState } from "react";
import axios from "axios";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

interface LineUser {
  id: number;
  name?: string;
  // 必要に応じて他のプロパティを追加
}

export function useLineUser() {
  const [user, setUser] = useState<LineUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // liffオブジェクトからline_idを取得（LIFF SDKがwindow.liffとしてグローバルに存在する前提）
        let line_id = "";
        if (
          typeof window !== "undefined" &&
          'liff' in window &&
          typeof (window as { liff?: any }).liff?.isLoggedIn === 'function' &&
          (window as { liff: { isLoggedIn: () => boolean } }).liff.isLoggedIn()
        ) {
          const profile = await (window as { liff: { getProfile: () => Promise<{ userId: string }> } }).liff.getProfile();
          line_id = profile.userId;
        } else {
          // ローカル開発や未ログイン時の仮ID
          line_id = "Ua08801bcbe21d7c2985ed58d24006472";
        }
        type LiffProfile = { userId: string };
        type LiffObject = {
          isLoggedIn: () => boolean;
          getProfile: () => Promise<LiffProfile>;
        };
        const win = window as unknown as { liff?: LiffObject };
        const res = await axios.post(
          `${WP_BASE_URL}/wp-json/custom/v1/me`,
          { line_id },
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.data && res.data.id) setUser(res.data);
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { user, loading };
}
