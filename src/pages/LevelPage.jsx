// src/pages/LevelPage.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'  // <-- تعديل المسار

import PdfSection from '../components/PdfSection'
import WordSection from '../components/WordSection'
import VideoSection from '../components/VideoSection'
import ImageSection from '../components/ImageSection'

function LevelPage() {
  const { level, section } = useParams()

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  const names = {
    pdf: 'مذكرات PDF',
    word: 'مذكرات Word',
    print: 'مطبوعات',
    videos: 'فيديوهات',
    tests: 'فروض',
    exams: 'اختبارات',
    draw: 'رسومات صماء',
    charts: 'مخططات',
    program: 'المنهاج',
    guide: 'الدليل',
    support: 'المعالجة البيداغوجية',
  }

  const levelNames = {
    first: 'الأولى متوسط',
    second: 'الثانية متوسط',
    third: 'الثالثة متوسط',
    fourth: 'الرابعة متوسط',
  }

  useEffect(() => {
    loadLessons()
  }, [level, section])

  async function loadLessons() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('level', level)
        .eq('section', section)
        .order('id', { ascending: false })

      if (error) {
        console.error(error)
        setLessons([])
      } else {
        setLessons(data || [])
      }
    } catch (err) {
      console.error(err)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  function renderContent() {
    switch (section) {
      case 'videos':
        return <VideoSection lessons={lessons} />

      case 'word':
        return <WordSection lessons={lessons} />

      case 'print':
      case 'draw':
      case 'charts':
        return <ImageSection lessons={lessons} />

      default:
        return <PdfSection lessons={lessons} />
    }
  }

  return (
    <>
      <Navbar />

      <div className="page">
        <h1 className="level-title">{levelNames[level]}</h1>

        <h2
          style={{
            textAlign: 'center',
            marginBottom: '35px',
          }}
        >
          {names[section]}
        </h2>

        {loading ? (
          <h3 style={{ textAlign: 'center' }}>جاري تحميل الملفات...</h3>
        ) : lessons.length === 0 ? (
          <h3 style={{ textAlign: 'center' }}>
            لا توجد ملفات في هذا القسم.
          </h3>
        ) : (
          renderContent()
        )}
      </div>

      <Footer />
    </>
  )
}

export default LevelPage