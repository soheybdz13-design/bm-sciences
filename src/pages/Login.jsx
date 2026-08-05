// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/admin");
  }

  // دالة "نسيت كلمة السر" باستخدام Supabase
  async function handleResetPassword() {
    if (!email) {
      alert("من فضلك أدخل البريد الإلكتروني أولاً.");
      return;
    }

    setResetLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://bm-sciences.netlify.app/reset-password",
    });

    setResetLoading(false);

    if (error) {
      console.error(error);
      setMessage("وقع خطأ أثناء إرسال رابط إعادة التعيين: " + error.message);
    } else {
      setMessage("تم إرسال رابط إعادة تعيين كلمة السر للبريد الإلكتروني.");
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 450, margin: "50px auto" }}>
        <h2 style={{ textAlign: "center" }}>
          تسجيل دخول الإدارة
        </h2>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "جاري تسجيل الدخول..." : "دخول"}
        </button>

        <br />
        <br />

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={resetLoading}
          style={{ backgroundColor: "#eee", color: "#333" }}
        >
          {resetLoading ? "جاري إرسال رابط إعادة التعيين..." : "نسيت كلمة السر؟"}
        </button>

        {message && (
          <>
            <br />
            <p style={{ marginTop: "10px", textAlign: "center" }}>{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;