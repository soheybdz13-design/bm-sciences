import { useState } from "react";
import Navbar from "../components/Navbar";
import LevelCard from "../components/LevelCard";
import Footer from "../components/Footer";

function Home() {

  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.body.classList.toggle("dark");
  };

  return (
    <>
      <Navbar toggleDark={toggleDark} />

      <section className="levels">

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

      </section>

      <Footer />
    </>
  );
}

export default Home;