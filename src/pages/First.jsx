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
  FaTools
} from "react-icons/fa";

function First() {

  const sections = [
    { title: "مذكرات PDF", icon: <FaFilePdf />, path: "/first/pdf" },
    { title: "مذكرات Word", icon: <FaFileWord />, path: "/first/word" },
    { title: "مطبوعات", icon: <FaPrint />, path: "/first/print" },
    { title: "فيديوهات", icon: <FaVideo />, path: "/first/videos" },
    { title: "فروض", icon: <FaClipboard />, path: "/first/tests" },
    { title: "اختبارات", icon: <FaClipboardCheck />, path: "/first/exams" },
    { title: "رسومات صماء", icon: <FaImage />, path: "/first/draw" },
    { title: "مخططات", icon: <FaSitemap />, path: "/first/charts" },
    { title: "المنهاج", icon: <FaBook />, path: "/first/program" },
    { title: "الدليل", icon: <FaBookOpen />, path: "/first/guide" },
    { title: "المعالجة البيداغوجية", icon: <FaTools />, path: "/first/support" }
  ];

  return (
    <>
      <Navbar />

      <div className="page">

        <h1 className="level-title first-color">
          الأولى متوسط
        </h1>

        <div className="sections-grid first-level">

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

export default First;