import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { supabase } from './lib/supabaseClient'
import './App.css'

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
import ResetPassword from './pages/ResetPassword'
import LessonDetails from './pages/LessonDetails'

import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Disclaimer from './pages/Disclaimer'

function AppRoutes() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })

    return () => subscription.unsubscribe()
  }, [])

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

  if (loading) {
    return (
      <h2 style={{ textAlign: 'center' }}>
        جاري التحميل...
      </h2>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/first" element={<First />} />
      <Route path="/second" element={<Second />} />
      <Route path="/third" element={<Third />} />
      <Route path="/fourth" element={<Fourth />} />

      <Route
        path="/lessons/:level"
        element={<Lessons />}
      />

      <Route
        path="/all-lessons"
        element={<AllLessons />}
      />

      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/disclaimer"
        element={<Disclaimer />}
      />

      <Route path="/login" element={<Login />} />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

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

      <Route
        path="/lesson/:id"
        element={<LessonDetails />}
      />

      <Route
        path="/:level/:section/:term"
        element={<LevelPage />}
      />

      <Route
        path="/:level/:section"
        element={<LevelPage />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}