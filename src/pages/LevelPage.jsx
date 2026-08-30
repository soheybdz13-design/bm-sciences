import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'

import PdfSection from '../components/PdfSection'
import WordSection from '../components/WordSection'
import VideoSection from '../components/VideoSection'
import ImageSection from '../components/ImageSection'
import PptSection from '../components/PptSection'

function getLastNumber(title = '') {
  const normalizedTitle = title.replace(
    /[٠-٩]/g,
    digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit).toString()
  )

  const numbers = normalizedTitle.match(/\d+/g)

  if (!numbers || numbers.length === 0) {
    return -1
  }

  return Number(numbers[numbers.length - 1])
}

function LevelPage() {
  const { level, section, term } = useParams()

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  const names = {
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

  const levelNames = {
    first: 'الأولى متوسط',
    second: 'الثانية متوسط',
    third: 'الثالثة متوسط',
    fourth: 'الرابعة متوسط',
  }

  const termNames = {
    term1: 'الفصل الأول',
    term2: 'الفصل الثاني',
    term3: 'الفصل الثالث',
  }

  const hasTerms = section === 'tests' || section === 'exams'

  useEffect(() => {
    if (hasTerms && !term) {
      setLessons([])
      setLoading(false)
      return
    }

    loadLessons()
  }, [level, section, term])

  async function loadLessons() {
    try {
      setLoading(true)

      let query = supabase
        .from('lessons')
        .select('*')
        .eq('level', level)
        .eq('section', section)
        .order('created_at', { ascending: false })

      if (term) {
        query = query.eq('term', term)
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        setLessons([])
        return
      }

      const sortedLessons = [...(data || [])].sort((a, b) => {
        const numberA = getLastNumber(a.title)
        const numberB = getLastNumber(b.title)

        if (numberA !== numberB) {
          return numberB - numberA
        }

        return b.title.localeCompare(a.title, 'ar')
      })

      setLessons(sortedLessons)
    } catch (error) {
      console.error(error)
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
      case 'teacher_documents':
        return <ImageSection lessons={lessons} />

      case 'ppt':
        return <PptSection lessons={lessons} />

      default:
        return <PdfSection lessons={lessons} />
    }
  }

  function renderTerms() {
    const prefix = section === 'tests' ? 'فروض' : 'اختبارات'

    return (
      <div className="sections-grid">
        <Link
          to={`/${level}/${section}/term1`}
          className="section-card"
        >
          <h3>{prefix} الفصل الأول</h3>
        </Link>

        <Link
          to={`/${level}/${section}/term2`}
          className="section-card"
        >
          <h3>{prefix} الفصل الثاني</h3>
        </Link>

        <Link
          to={`/${level}/${section}/term3`}
          className="section-card"
        >
          <h3>{prefix} الفصل الثالث</h3>
        </Link>
      </div>
    )
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
          {names[section] || 'قسم غير معروف'}
          {term ? ` - ${termNames[term]}` : ''}
        </h2>

        {hasTerms && !term ? (
          renderTerms()
        ) : loading ? (
          <h3 style={{ textAlign: 'center' }}>
            جاري تحميل الملفات...
          </h3>
        ) : lessons.length === 0 ? (
          <h3
            style={{
              textAlign: 'center',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.9,
            }}
          >
            فهرس الملفات في صيانة تقنية مؤقتة. الملفات محفوظة وآمنة وستعود
            قريبًا.
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