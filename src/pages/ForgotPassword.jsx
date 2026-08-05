// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e) {
    e.preventDefault();

    if (!email) {
      setMessage("أدخل البريد الإلكتروني.");
      return;
    }

    setLoading(true);
    setMessage("");

    // توليد كود 6 أرقام
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // تخزين الكود في جدول password_resets
    const { error } = await supabase.from("password_resets").insert([
      {
        email,
        code,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("وقع خطأ أثناء توليد الكود: " + error.message);
      return;
    }

    // الآن، نظهر الكود مؤقتًا (للتجربة). لاحقًا نرسله بالبريد.
    setMessage(`تم إنشاء الكود بنجاح. الكود هو: ${code}`);
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 450, margin: "50px auto" }}>
        <h2 style={{ textAlign: "center" }}>نسيت كلمة السر</h2>

        <form onSubmit={handleSendCode}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          <button type="submit" disabled={loading}>
            {loading ? "جاري إرسال الكود..." : "إرسال كود الاستعادة"}
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

export default ForgotPassword;