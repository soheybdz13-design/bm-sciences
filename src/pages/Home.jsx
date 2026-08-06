import { useState } from "react";
import Navbar from "../components/Navbar";
import LevelCard from "../components/LevelCard";
import Footer from "../components/Footer";
import UserUpload from "../components/UserUpload"; // فورم رفع ملفات الزوار

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
        <section className="hero">
          <h1>BM Sciences</h1>

          <p>
            منصة تعليمية متخصصة في علوم الطبيعة والحياة
            لجميع مستويات التعليم المتوسط.
          </p>
        </section>

        <section className="levels">
          <h2 className="levels-title">
            اختر المستوى الدراسي
          </h2>

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

        {/* فورم رفع الملفات من طرف الزوار */}
        <section style={{ marginTop: "40px" }}>
          <UserUpload />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;