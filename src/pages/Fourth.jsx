import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

import {
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaPrint,
  FaVideo,
  FaClipboard,
  FaClipboardCheck,
  FaImage,
  FaSitemap,
  FaBook,
  FaBookOpen,
  FaPencilAlt,
  FaListAlt,
  FaFolderOpen,
} from 'react-icons/fa'

function Fourth() {
  const sections = [
    {
      title: 'مذكرات PDF',
      icon: <FaFilePdf />,
      path: '/fourth/pdf',
    },
    {
      title: 'مذكرات Word',
      icon: <FaFileWord />,
      path: '/fourth/word',
    },
    {
      title: 'مطبوعات',
      icon: <FaPrint />,
      path: '/fourth/print',
    },
    {
      title: 'فيديوهات',
      icon: <FaVideo />,
      path: '/fourth/videos',
    },
    {
      title: 'عروض PPT',
      icon: <FaFilePowerpoint />,
      path: '/fourth/ppt',
    },
    {
      title: 'فروض',
      icon: <FaClipboard />,
      path: '/fourth/tests',
    },
    {
      title: 'اختبارات',
      icon: <FaClipboardCheck />,
      path: '/fourth/exams',
    },
    {
      title: 'مواضيع BEM',
      icon: <FaFilePdf />,
      path: '/fourth/bem',
    },
    {
      title: 'تمارين ووضعيات',
      icon: <FaPencilAlt />,
      path: '/fourth/exercises',
    },
    {
      title: 'ملخصات',
      icon: <FaListAlt />,
      path: '/fourth/summaries',
    },
    {
      title: 'رسومات صماء',
      icon: <FaImage />,
      path: '/fourth/draw',
    },
    {
      title: 'مخططات',
      icon: <FaSitemap />,
      path: '/fourth/charts',
    },
    {
      title: 'المنهاج',
      icon: <FaBook />,
      path: '/fourth/program',
    },
    {
      title: 'الدليل',
      icon: <FaBookOpen />,
      path: '/fourth/guide',
    },
    {
      title: 'تقويم تشخيصي ووثائق أخرى',
      icon: <FaFolderOpen />,
      path: '/fourth/teacher_documents',
    },
    {
      title: 'التدرج السنوي',
      icon: <FaBook />,
      path: '/fourth/annual_progression',
    },
    {
      title: 'التوزيع الشهري',
      icon: <FaListAlt />,
      path: '/fourth/monthly_distribution',
    },
  ]

  return (
    <>
      <Navbar />

      <div className="page">
        <h1 className="level-title fourth-color">
          الرابعة متوسط
        </h1>

        <div className="sections-grid fourth-level">
          {sections.map(item => (
            <Link
              key={item.path}
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
  )
}

export default Fourth