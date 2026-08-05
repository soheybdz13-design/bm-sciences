// src/pages/ResetWithCode.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ResetWithCode() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();

    if (!email || !code || !password) {
      setMessage("أدخل البريد، الكود، وكلمة السر الجديدة.");
      return;
    }

    setLoading(true);
    setMessage("");

    // نتحقق من الكود في جدول password_resets
    const { data, error } = await supabase
      .from("password_resets")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
      setMessage("وقع خطأ أثناء التحقق من الكود: " + error.message);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("الكود غير صحيح أو تم استعماله من قبل.");
      setLoading(false);
      return;
    }

    // في هذه المرحلة، الكود صحيح. نظهر رسالة فقط.
    // لاحقًا نربطها بـ backend لتحديث كلمة السر فعليًا.
    setMessage("الكود صحيح. نحتاج الآن endpoint آمن لتحديث كلمة السر في Supabase.");

    setLoading(false);
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 450, margin: "50px auto" }}>
        <h2 style={{ textAlign: "center" }}>إعادة تعيين كلمة السر بكود</h2>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          <input
            type="text"
            placeholder="الكود المرسل"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <br /><br />
          <input
            type="password"
            placeholder="كلمة السر الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />
          <button type="submit" disabled={loading}>
            {loading ? "جاري التحقق..." : "تحديث كلمة السر"}
          </button>
        </form>

        {message && (
          <>
            <br />
            <p style={{ textAlign: "center" }}>{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetWithCode;