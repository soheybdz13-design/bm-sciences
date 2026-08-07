import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

import {
  FaFilePdf,
  FaFileWord,
  FaPrint,
  FaVideo,
  FaClipboard,
  FaClipboardCheck,
  FaImage,
  FaSitemap,
  FaBook,
  FaBookOpen,
  FaTools,
  FaPencilAlt,
  FaListAlt
} from "react-icons/fa";

function Third() {
  const sections = [
    { title: "مذكرات PDF", icon: <FaFilePdf />, path: "/third/pdf" },
    { title: "مذكرات Word", icon: <FaFileWord />, path: "/third/word" },
    { title: "مطبوعات", icon: <FaPrint />, path: "/third/print" },
    { title: "فيديوهات", icon: <FaVideo />, path: "/third/videos" },
    { title: "فروض", icon: <FaClipboard />, path: "/third/tests" },
    { title: "اختبارات", icon: <FaClipboardCheck />, path: "/third/exams" },
    {
      title: "تمارين ووضعيات",
      icon: <FaPencilAlt />,
      path: "/third/exercises"
    },
    {
      title: "ملخصات",
      icon: <FaListAlt />,
      path: "/third/summaries"
    },
    { title: "رسومات صماء", icon: <FaImage />, path: "/third/draw" },
    { title: "مخططات", icon: <FaSitemap />, path: "/third/charts" },
    { title: "المنهاج", icon: <FaBook />, path: "/third/program" },
    { title: "الدليل", icon: <FaBookOpen />, path: "/third/guide" },
    {
      title: "المعالجة البيداغوجية",
      icon: <FaTools />,
      path: "/third/support"
    }
  ];

  return (
    <>
      <Navbar />

      <div className="page">
        <h1 className="level-title third-color">
          الثالثة متوسط
        </h1>

        <div className="sections-grid third-level">
          {sections.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="section-card"
            >
              <div className="section-icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Third;