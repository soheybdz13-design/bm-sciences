import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import './App.css'

import Home from './pages/Home'
import First from './pages/First'
import Second from './pages/Second'
import Third from './pages/Third'
import Fourth from './pages/Fourth'
import About from './pages/About'
import Contact from './pages/Contact'
import LevelPage from './pages/LevelPage'
import Lessons from './pages/Lessons'
import AllLessons from './pages/AllLessons'
import LessonDetails from './pages/LessonDetails'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Disclaimer from './pages/Disclaimer'

function MaintenanceAdmin() {
  return (
    <main
      dir="rtl"
      style={{
        maxWidth: '720px',
        margin: '50px auto',
        padding: '24px',
        textAlign: 'center',
        lineHeight: 1.9,
      }}
    >
      <h1>لوحة الإدارة متوقفة مؤقتًا</h1>

      <p>
        قاعدة البيانات في صيانة تقنية مؤقتة بسبب تجاوز حد نقل البيانات.
      </p>

      <p>
        ملفات المنصة الموجودة في Cloudflare محفوظة وآمنة، وستعود لوحة الإدارة
        بعد استعادة خدمة قاعدة البيانات.
      </p>
    </main>
  )
}

function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return undefined
    }

    const listener = CapacitorApp.addListener(
      'backButton',
      ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back()
          return
        }

        if (window.location.pathname !== '/') {
          navigate(-1)
        }
      }
    )

    return () => {
      listener.then(handle => handle.remove())
    }
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/first" element={<First />} />
      <Route path="/second" element={<Second />} />
      <Route path="/third" element={<Third />} />
      <Route path="/fourth" element={<Fourth />} />

      <Route path="/lessons/:level" element={<Lessons />} />
      <Route path="/all-lessons" element={<AllLessons />} />

      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/disclaimer" element={<Disclaimer />} />

      <Route path="/login" element={<MaintenanceAdmin />} />
      <Route path="/reset-password" element={<MaintenanceAdmin />} />
      <Route path="/admin" element={<MaintenanceAdmin />} />

      <Route path="/lesson/:id" element={<LessonDetails />} />

      <Route path="/:level/:section/:term" element={<LevelPage />} />
      <Route path="/:level/:section" element={<LevelPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}