"use client";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import styles from "../../components/TopPage.module.css";
import { useLineUser } from "@/hooks/useLineUser";
import { useSearchParams } from "next/navigation";
import CryptoJS from "crypto-js";

type SurveyForm = {
  fm_label: string;
  fm_type: string;
  fm_value?: string;
};

type SurveyDetail = {
  group?: { fm_title: string; fm_text: string } | null;
  date?: string;
  form?: SurveyForm[];
  post?: { ID: number };
  content?: string;
};

function SurveyDetailContent() {
  const { user, loading } = useLineUser();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [detail, setDetail] = useState<SurveyDetail | null>(null);
  const [fetching, setFetching] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    data.user_id = user ? String(user.id) : "";

    // 数値フィールドの変換
    if (data.grade) data.grade = String(Number(data.grade));
    if (data.class) data.class = String(Number(data.class));

    // 署名の生成
    const secret = process.env.NEXT_PUBLIC_CUR_SHARED_SECRET || "";
    const jsonBody = JSON.stringify(data);
    const signature = CryptoJS.HmacSHA256(jsonBody, secret).toString(CryptoJS.enc.Hex);

    try {
      const response = await axios.post("/wp-api/custom/v1/survey_reply", data, {
        headers: {
          'X-Signature': signature,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log('送信成功:', response.data);
      alert('送信しました');
    } catch (error) {
      console.error('送信エラー:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      alert('送信に失敗しました');
    }
  };

  useEffect(() => {
    if (!user || !id) return;
    setFetching(true);
    axios
      .get("/wp-api/custom/v1/survey_detail", {
        params: { user_id: user.id, survey_id: id },
      })
      .then((res) => {
        console.log('取得成功:', res.data);
        console.log('データ構造:', JSON.stringify(res.data, null, 2));
        setDetail(res.data);
      })
      .catch((error) => {
        console.error('データ取得エラー:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
        }
        
        // 開発時のフォールバック: テスト用ダミーデータ
        if (process.env.NODE_ENV === 'development') {
          const dummyData: SurveyDetail = {
            group: {
              fm_title: 'テスト アンケート',
              fm_text: 'これはテスト用のアンケートです。'
            },
            date: '2025-08-28',
            form: [
              {
                fm_label: 'お名前',
                fm_type: 'text',
                fm_value: ''
              },
              {
                fm_label: '満足度',
                fm_type: 'radio',
                fm_value: '非常に満足,満足,普通,不満,非常に不満'
              },
              {
                fm_label: 'ご意見',
                fm_type: 'textarea',
                fm_value: ''
              }
            ],
            post: { ID: 1 }
          };
          setDetail(dummyData);
        } else {
          setDetail(null);
        }
      })
      .finally(() => setFetching(false));
  }, [user, id]);

  if (loading || fetching) {
    return <main className={styles.main}>読み込み中...</main>;
  }
  if (!detail) {
    return <main className={styles.main}>詳細情報が取得できませんでした。</main>;
  }

  return (
    <main className={styles.main}>
      <div>
        <h2 className={styles.sectionTitle}>アンケート詳細</h2>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div>
            <div>タイトル: {detail.group?.fm_title || 'タイトル不明'}</div>
            <div>{detail.group?.fm_text || ''}</div>
            <div>日付: {detail.date || '日付不明'}</div>
          </div>
          {detail.form &&
            detail.form.map((form, formIdx) => {
              const options = form.fm_value ? form.fm_value.split(",") : [];
              const formKey = `form_${formIdx}`;
              return (
                <div className="form-group" key={formKey}>
                  <label htmlFor={formKey}>{form.fm_label}</label>
                  <br />
                  {form.fm_type === "text" && (
                    <input
                      type="text"
                      className="form-control"
                      id={formKey}
                      name={formKey}
                      defaultValue=""
                    />
                  )}
                  {form.fm_type === "textarea" && (
                    <textarea 
                      className="form-control" 
                      id={formKey} 
                      name={formKey}
                      rows={4}
                    ></textarea>
                  )}
                  {form.fm_type === "radio" &&
                    options.map((option, optIdx) => (
                      <div className="form-check" key={optIdx}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name={formKey}
                          id={`${formKey}_${option.trim()}`}
                          value={option.trim()}
                        />
                        <label 
                          className="form-check-label" 
                          htmlFor={`${formKey}_${option.trim()}`}
                        >
                          {option.trim()}
                        </label>
                      </div>
                    ))}
                </div>
              );
            })}
          <input
            type="hidden"
            name="post_id"
            id="post_id"
            value={detail.post?.ID || 0}
          />
          <button type="submit" className={styles.submitButton}>
            送信
          </button>
        </form>
      </div>
    </main>
  );
}

export default function SurveyDetailPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <SurveyDetailContent />
    </Suspense>
  );
}
