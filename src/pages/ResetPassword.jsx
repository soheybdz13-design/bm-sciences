// src/pages/ResetPassword.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(e) {
    e.preventDefault();

    if (!password || !confirm) {
      setMessage("من فضلك أدخل كلمة السر الجديدة وتأكيدها.");
      return;
    }

    if (password !== confirm) {
      setMessage("كلمتا السر غير متطابقتين.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("وقع خطأ أثناء تحديث كلمة السر: " + error.message);
    } else {
      setMessage("تم تحديث كلمة السر بنجاح، سيتم توجيهك لتسجيل الدخول.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 450, margin: "50px auto" }}>
        <h2 style={{ textAlign: "center" }}>إعادة تعيين كلمة السر</h2>

        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            placeholder="كلمة السر الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <br />
          <input
            type="password"
            placeholder="تأكيد كلمة السر الجديدة"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <br />
          <br />
          <button type="submit" disabled={loading}>
            {loading ? "جاري تحديث كلمة السر..." : "تحديث كلمة السر"}
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

// ضروري:
export default ResetPassword;