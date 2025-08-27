"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./Layout.module.css";

import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <Image src="/logo.png" alt="ロゴ" className={styles.logo} width={40} height={40} priority />
          <span className={styles.serviceName}>Pken Vote サービス</span>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <nav className={styles.footerNav}>
        <Link href="/" className={styles.navItem}>
          <span className={styles.icon}>
            {/* ホームアイコン */}
            <svg width="24" height="24" fill="none"><path d="M3 12L12 4l9 8" stroke="#1976d2" strokeWidth="2"/><path d="M5 10v10h14V10" stroke="#1976d2" strokeWidth="2"/></svg>
          </span>
          <span className={styles.navLabel}>ダッシュボード</span>
        </Link>
        <Link href="/survey-history" className={styles.navItem}>
          <span className={styles.icon}>
            {/* 履歴アイコン */}
            <svg width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1976d2" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#1976d2" strokeWidth="2"/></svg>
          </span>
          <span className={styles.navLabel}>アンケート一覧</span>
        </Link>
        <Link href="/profile-edit" className={styles.navItem}>
          <span className={styles.icon}>
            {/* ユーザーアイコン */}
            <svg width="24" height="24" fill="none"><circle cx="12" cy="8" r="4" stroke="#1976d2" strokeWidth="2"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="#1976d2" strokeWidth="2"/></svg>
          </span>
          <span className={styles.navLabel}>プロフィール</span>
        </Link>
      </nav>
    </div>
  );
}