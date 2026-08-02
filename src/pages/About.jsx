import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />

      <div className="page">

        <h1>من نحن</h1>

        <p>
          BM Sciences منصة تعليمية موجهة لأساتذة علوم الطبيعة والحياة
          بالتعليم المتوسط.
        </p>

        <p>
          هدفنا توفير المذكرات، الفروض، الاختبارات، الفيديوهات
          والوثائق التربوية في مكان واحد.
        </p>

      </div>

      <Footer />
    </>
  );
}

export default About;