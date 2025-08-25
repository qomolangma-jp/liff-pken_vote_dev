"use client";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import styles from "../../components/TopPage.module.css";
import { useLineUser } from "@/hooks/useLineUser";
import { useSearchParams } from "next/navigation";
import CryptoJS from "crypto-js";

const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_BASE_URL;

export default function SurveyDetailPage() {
  type SurveyForm = {
    fm_label: string;
    fm_type: string;
    fm_value?: string;
  };

  type SurveyDetail = {
    group: { fm_title: string; fm_text: string };
    date: string;
    form: SurveyForm[];
    post: { ID: number };
    content?: string;
  };

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

    if (data.grade) data.grade = String(Number(data.grade));
    if (data.class) data.class = String(Number(data.class));

    const secret = process.env.NEXT_PUBLIC_CUR_SHARED_SECRET || "";
    const jsonBody = JSON.stringify(data);
    const signature = CryptoJS.HmacSHA256(jsonBody, secret).toString(CryptoJS.enc.Hex);

    try {
      await axios.post("/wp-api/custom/v1/survey_reply", data, {
        headers: {
          "X-Signature": signature,
          "Content-Type": "application/json",
        },
      });
      alert("送信しました");
    } catch {
      alert("送信に失敗しました");
    }
  };

  // ← useEffect は「副作用のみ」。JSXは返さない！
  useEffect(() => {
    if (!id || loading || !user?.id) return;

  const fetchDetail = async () => {
    setFetching(true);
    try {
      const res = await axios.get(
        `${WP_BASE_URL}/wp-json/custom/v1/survey_detail`,
        {
          params: {
            id: String(id),
            user_id: String(user.id), // ★ これが必須
          },
          withCredentials: true, // 認証cookieが必要な場合に備える
        }
      );
      setDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  fetchDetail();
}, [id, user?.id, loading]);

  return (
    <main className={styles.main}>
      <Suspense>
        {fetching && <div>読み込み中...</div>}
        {!fetching && detail && (
          <div>
            <h2 className={styles.sectionTitle}>アンケート詳細</h2>
            <form className={styles.formCard} onSubmit={handleSubmit}>
              <div>
                <div>タイトル: {detail.group.fm_title}</div>
                <div>{detail.group.fm_text}</div>
                <div>日付: {detail.date}</div>
              </div>

              {detail.form?.map((form, formIdx) => {
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
                      <textarea className="form-control" id={formKey} name={formKey} />
                    )}
                    {form.fm_type === "radio" &&
                      options.map((option, optIdx) => {
                        const val = option.trim();
                        const idFor = `${formKey}_${val}`;
                        return (
                          <div className="form-check" key={optIdx}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={formKey}
                              id={idFor}
                              value={val}
                            />
                            <label className="form-check-label" htmlFor={idFor}>
                              {val}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                );
              })}

              <input type="hidden" name="post_id" id="post_id" value={detail.post.ID} />
              <button type="submit">送信</button>
            </form>
          </div>
        )}
      </Suspense>
    </main>
  );
}
