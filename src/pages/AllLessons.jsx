import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import LessonCard from '../components/LessonCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function AllLessons() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLessons()
  }, [])

  async function loadLessons() {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error(error)
        setLessons([])
        return
      }

      setLessons(data || [])
    } catch (error) {
      console.error(error)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className="page">
        <h1>كل الدروس والملفات</h1>

        {loading ? (
          <p>جاري تحميل الملفات...</p>
        ) : lessons.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              lineHeight: 1.9,
              maxWidth: '700px',
              margin: '30px auto',
            }}
          >
            فهرس الدروس في صيانة تقنية مؤقتة. الملفات محفوظة وآمنة وستعود
            قريبًا.
          </p>
        ) : (
          lessons.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))
        )}
      </div>

      <Footer />
    </>
  )
}

export default AllLessons