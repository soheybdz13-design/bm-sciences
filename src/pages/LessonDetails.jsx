import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import { getFileUrl, isArchiveFile } from '../utils/fileUrl'

const levelNames = {
  first: 'الأولى متوسط',
  second: 'الثانية متوسط',
  third: 'الثالثة متوسط',
  fourth: 'الرابعة متوسط',
}

const sectionNames = {
  pdf: 'مذكرات PDF',
  word: 'مذكرات Word',
  print: 'مطبوعات',
  videos: 'فيديوهات',
  ppt: 'عروض PPT',
  tests: 'فروض',
  exams: 'اختبارات',
  bem: 'مواضيع BEM',
  exercises: 'تمارين ووضعيات',
  summaries: 'ملخصات',
  draw: 'رسومات صماء',
  charts: 'مخططات',
  program: 'المنهاج',
  guide: 'الدليل',
  support: 'المعالجة البيداغوجية',
  teacher_documents: 'تقويم تشخيصي ووثائق أخرى',
  annual_progression: 'التدرج السنوي',
  monthly_distribution: 'التوزيع الشهري',
}

const termNames = {
  term1: 'الفصل الأول',
  term2: 'الفصل الثاني',
  term3: 'الفصل الثالث',
}

function getLessonFile(lesson) {
  const archiveUrl = getFileUrl(lesson.archive)

  if (archiveUrl && isArchiveFile(lesson.archive)) {
    return {
      type: 'archive',
      url: archiveUrl,
      label: 'ملف مضغوط ZIP أو RAR',
      openLabel: 'فتح الملف المضغوط',
      downloadLabel: '⬇ تحميل الملف المضغوط',
    }
  }

  const pdfUrl = getFileUrl(lesson.pdf)

  if (pdfUrl) {
    return {
      type: 'pdf',
      url: pdfUrl,
      label: 'ملف PDF',
      openLabel: '👁️ فتح ملف PDF',
      downloadLabel: '⬇ تحميل PDF',
    }
  }

  const wordUrl = getFileUrl(lesson.word)

  if (wordUrl) {
    return {
      type: 'word',
      url: wordUrl,
      label: 'ملف Word',
      openLabel: '👁️ فتح ملف Word',
      downloadLabel: '⬇ تحميل ملف Word',
    }
  }

  const pptUrl = getFileUrl(lesson.ppt)

  if (pptUrl) {
    return {
      type: 'ppt',
      url: pptUrl,
      label: 'عرض PowerPoint',
      openLabel: '👁️ فتح العرض',
      downloadLabel: '⬇ تحميل العرض',
    }
  }

  const imageUrl = getFileUrl(lesson.image)

  if (imageUrl && lesson.image !== 'EMPTY') {
    return {
      type: 'image',
      url: imageUrl,
      label: 'صورة',
      openLabel: '🔍 فتح الصورة',
      downloadLabel: '⬇ تحميل الصورة',
    }
  }

  const videoUrl = getFileUrl(lesson.video)

  if (videoUrl && lesson.video !== 'EMPTY') {
    return {
      type: 'video',
      url: videoUrl,
      label: 'فيديو',
      openLabel: '▶ فتح الفيديو',
      downloadLabel: '⬇ تحميل الفيديو',
    }
  }

  return null
}

function LessonDetails() {
  const { id } = useParams()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLesson()
  }, [id])

  async function loadLesson() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error(error)
        setLesson(null)
        return
      }

      setLesson(data)
    } catch (error) {
      console.error(error)
      setLesson(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page">
          <h2 style={{ textAlign: 'center' }}>
            جاري تحميل الملف...
          </h2>
        </main>
        <Footer />
      </>
    )
  }

  if (!lesson) {
    return (
      <>
        <Navbar />
        <main className="page">
          <h1 className="level-title">الملف غير موجود</h1>

          <div style={{ textAlign: 'center' }}>
            <p>ربما تم حذف الملف أو أن الرابط غير صحيح.</p>

            <Link to="/" className="lesson-btn">
              العودة للرئيسية
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const file = getLessonFile(lesson)

  const backPath = lesson.term
    ? `/${lesson.level}/${lesson.section}/${lesson.term}`
    : `/${lesson.level}/${lesson.section}`

  return (
    <>
      <Navbar />

      <main className="page">
        <p
          style={{
            textAlign: 'center',
            marginBottom: '12px',
            color: '#666',
          }}
        >
          {levelNames[lesson.level]} — {sectionNames[lesson.section]}
          {lesson.term ? ` — ${termNames[lesson.term]}` : ''}
        </p>

        <h1
          className="level-title"
          style={{
            maxWidth: '1100px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {lesson.title}
        </h1>

        {lesson.description && (
          <p
            style={{
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 25px',
              lineHeight: 1.8,
            }}
          >
            {lesson.description}
          </p>
        )}

        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          {file ? (
            <>
              <p style={{ marginBottom: '20px' }}>
                {file.label}
              </p>

              {file.type === 'image' && (
                <img
                  src={file.url}
                  alt={lesson.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '600px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    marginBottom: '20px',
                  }}
                />
              )}

              {file.type === 'video' && (
                <video
                  controls
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <source src={file.url} type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lesson-btn"
                >
                  {file.openLabel}
                </a>

                <a
                  href={file.url}
                  download
                  className="lesson-btn"
                >
                  {file.downloadLabel}
                </a>

                <Link to={backPath} className="lesson-btn">
                  العودة إلى القسم
                </Link>
              </div>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '20px' }}>
                الملف غير متوفر حاليًا.
              </p>

              <Link to={backPath} className="lesson-btn">
                العودة إلى القسم
              </Link>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

export default LessonDetails