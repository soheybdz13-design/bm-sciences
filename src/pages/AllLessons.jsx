// src/pages/AllLessons.jsx
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

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      alert('وقع خطأ أثناء جلب الدروس')
    } else {
      setLessons(data || [])
    }

    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>كل الدروس والملفات</h1>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : lessons.length === 0 ? (
          <p>لا توجد دروس.</p>
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