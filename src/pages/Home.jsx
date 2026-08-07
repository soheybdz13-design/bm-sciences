import { useState } from "react";
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
        <section className="levels">
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

        <section style={{ marginTop: "40px" }}>
          <UserUpload />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;