// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

// الصفحات
import Home from './pages/Home'
import First from './pages/First'
import Second from './pages/Second'
import Third from './pages/Third'
import Fourth from './pages/Fourth'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Login from './pages/Login'
import LevelPage from './pages/LevelPage'
import Lessons from './pages/Lessons'
import AllLessons from './pages/AllLessons'
import ResetPassword from './pages/ResetPassword' // صفحة إعادة تعيين كلمة السر الجديدة

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // جلب الـ session من Supabase ومراقبة تغيّرات تسجيل الدخول/الخروج
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <h2 style={{ textAlign: 'center' }}>جاري التحميل...</h2>
  }

  return (
    <Routes>
      {/* الصفحة الرئيسية */}
      <Route path="/" element={<Home />} />

      {/* المستويات */}
      <Route path="/first" element={<First />} />
      <Route path="/second" element={<Second />} />
      <Route path="/third" element={<Third />} />
      <Route path="/fourth" element={<Fourth />} />

      {/* صفحة الدروس حسب المستوى (PDF فقط) */}
      <Route path="/lessons/:level" element={<Lessons />} />

      {/* صفحة كل الدروس والملفات (LessonCard) */}
      <Route path="/all-lessons" element={<AllLessons />} />

      {/* صفحة الأقسام حسب المستوى والقسم */}
      <Route path="/:level/:section" element={<LevelPage />} />

      {/* الصفحات الأخرى */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* تسجيل الدخول للإدارة */}
      <Route path="/login" element={<Login />} />

      {/* صفحة إعادة تعيين كلمة السر (بعد الضغط على رابط من البريد) */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* لوحة الإدارة محمية بالـ session من Supabase */}
      <Route
        path="/admin"
        element={
          session ? (
            <Admin />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App