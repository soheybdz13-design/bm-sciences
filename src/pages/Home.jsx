import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LevelCard from "../components/LevelCard";
import Footer from "../components/Footer";
import UserUpload from "../components/UserUpload";

function Home() {
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.body.classList.toggle("dark");
  };

  return (
    <>
      <Navbar toggleDark={toggleDark} />

      <main className="home">
        <section className="levels" aria-labelledby="levels-title">
          <h1 id="levels-title">
            CEM Sciences | علوم الطبيعة والحياة للتعليم المتوسط
          </h1>

          <p className="home-intro">
            منصة تعليمية جزائرية مخصّصة لمادة علوم الطبيعة والحياة في
            التعليم المتوسط. تجدون دروسًا ومذكرات وملخصات وتمارين وفروضًا
            واختبارات للمستويات الأربعة.
          </p>

          <div className="levels-grid">
            <LevelCard
              title="الأولى متوسط"
              path="/first"
            />

            <LevelCard
              title="الثانية متوسط"
              path="/second"
            />

            <LevelCard
              title="الثالثة متوسط"
              path="/third"
            />

            <LevelCard
              title="الرابعة متوسط"
              path="/fourth"
            />
          </div>
        </section>

        <section
          className="seo-content"
          aria-labelledby="resources-title"
        >
          <h2 id="resources-title">
            دروس وفروض واختبارات العلوم الطبيعية للمتوسط
          </h2>

          <p>
            يوفر موقع CEM Sciences موارد تعليمية لمادة علوم الطبيعة والحياة
            لتلاميذ التعليم المتوسط في الجزائر. يمكنكم تصفح الدروس والملخصات
            والتمارين والفروض والاختبارات حسب المستوى الدراسي.
          </p>

          <div className="seo-links">
            <Link to="/all-lessons">
              تصفح جميع دروس وملفات العلوم الطبيعية
            </Link>
          </div>
        </section>

        <section
          style={{ marginTop: "40px" }}
          aria-label="رفع ملف أو اقتراح مورد تعليمي"
        >
          <UserUpload />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;