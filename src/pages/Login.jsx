import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      </div>
    </div>
  );
}

export default Login;