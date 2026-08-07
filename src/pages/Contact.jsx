import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("يرجى ملء جميع الحقول.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/.netlify/functions/send-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "contact",
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر إرسال الرسالة");
      }

      setStatus("تم إرسال رسالتك بنجاح ✅ شكراً لتواصلك معنا.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("CONTACT ERROR:", err);
      setStatus("وقع خطأ أثناء إرسال الرسالة ❌ حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <div className="page">
        <h1>اتصل بنا</h1>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <textarea
            placeholder="اكتب رسالتك"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال"}
          </button>

          {status && (
            <p style={{ textAlign: "center", marginTop: "15px" }}>
              {status}
            </p>
          )}
        </form>
      </div>

      <Footer />
    </>
  );
}

export default Contact;