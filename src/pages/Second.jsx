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

function Second() {
  const sections = [
    { title: "مذكرات PDF", icon: <FaFilePdf />, path: "/second/pdf" },
    { title: "مذكرات Word", icon: <FaFileWord />, path: "/second/word" },
    { title: "مطبوعات", icon: <FaPrint />, path: "/second/print" },
    { title: "فيديوهات", icon: <FaVideo />, path: "/second/videos" },
    { title: "فروض", icon: <FaClipboard />, path: "/second/tests" },
    { title: "اختبارات", icon: <FaClipboardCheck />, path: "/second/exams" },
    {
      title: "تمارين ووضعيات",
      icon: <FaPencilAlt />,
      path: "/second/exercises"
    },
    {
      title: "ملخصات",
      icon: <FaListAlt />,
      path: "/second/summaries"
    },
    { title: "رسومات صماء", icon: <FaImage />, path: "/second/draw" },
    { title: "مخططات", icon: <FaSitemap />, path: "/second/charts" },
    { title: "المنهاج", icon: <FaBook />, path: "/second/program" },
    { title: "الدليل", icon: <FaBookOpen />, path: "/second/guide" },
    {
      title: "المعالجة البيداغوجية",
      icon: <FaTools />,
      path: "/second/support"
    }
  ];

  return (
    <>
      <Navbar />

      <div className="page">
        <h1 className="level-title second-color">
          الثانية متوسط
        </h1>

        <div className="sections-grid second-level">
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

export default Second;