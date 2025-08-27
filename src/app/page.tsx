// app/page.tsx
'use client';
import { useLiffCtx } from './liff/liff-provider';
import liff from '@line/liff';
import { useState } from 'react';

export default function Page() {
  const { ready, profile, error } = useLiffCtx();
  const [serverResult, setServerResult] = useState<any>(null);

  if (error) return <p style={{ color: 'red' }}>LIFFエラー: {error}</p>;
  if (!ready) return <p>Loading...</p>;

  const sendToServer = async () => {
    const idToken = liff.getIDToken(); // 'openid' スコープ必須
    const res = await fetch('/api/line/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const json = await res.json();
    setServerResult(json);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>こんにちは、{profile?.displayName} さん</h1>
      <img src={profile?.pictureUrl ?? ''} alt="" width={64} height={64} style={{ borderRadius: 8 }} />
      <div style={{ marginTop: 16 }}>
        <button onClick={sendToServer}>IDトークンをサーバー検証に送る</button>
      </div>
      {serverResult && (
        <pre style={{ marginTop: 16, background: '#f5f5f5', padding: 12 }}>
          {JSON.stringify(serverResult, null, 2)}
        </pre>
      )}
    </main>
  );
}
