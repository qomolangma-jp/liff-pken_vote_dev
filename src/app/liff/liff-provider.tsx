// app/(liff)/liff-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import liff from '@line/liff';

type LiffState = {
  ready: boolean;
  isInClient: boolean;
  profile?: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
  };
  error?: string;
};

const LiffCtx = createContext<LiffState>({ ready: false, isInClient: false });
export const useLiffCtx = () => useContext(LiffCtx);

export default function LiffProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiffState>({ ready: false, isInClient: false });

  const redirectUri = useMemo(() => {
    // 必要に応じて固定のコールバックにしてOK（Endpoint URL 配下であること）
    return typeof window !== 'undefined' ? window.location.href : undefined;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) throw new Error('NEXT_PUBLIC_LIFF_ID が未設定です');

        // 1) SDK 初期化
        await liff.init({ liffId });

        // 2) ログイン済みかチェック。未ログインなら LINE ログインに飛ばす
        if (!liff.isLoggedIn()) {
          await liff.login(redirectUri ? { redirectUri } : undefined);
          return; // ここでブラウザ遷移→戻ってくる
        }

        // 3) プロフィール取得（スコープは LIFF 側設定に依存）
        const p = await liff.getProfile();

        setState({
          ready: true,
          isInClient: liff.isInClient(),
          profile: {
            userId: p.userId,
            displayName: p.displayName,
            pictureUrl: p.pictureUrl,
            statusMessage: p.statusMessage,
          },
        });
      } catch (e: any) {
        console.error(e);
        setState((s) => ({ ...s, ready: false, error: String(e?.message ?? e) }));
      }
    })();
  }, [redirectUri]);

  return <LiffCtx.Provider value={state}>{children}</LiffCtx.Provider>;
}
