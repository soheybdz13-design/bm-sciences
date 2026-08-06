// src/pages/Admin.jsx
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AdminFiles from '../components/AdminFiles'
import AdminUserUploads from '../components/AdminUserUploads'
import { supabase } from '../lib/supabaseClient'

import { uploadImage } from '../services/uploadImage'
import { uploadPdf } from '../services/uploadPdf'
import { uploadWord } from '../services/uploadWord'
import { uploadVideo } from '../services/uploadVideo'

function Admin() {
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [section, setSection] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('') // رابط YouTube اختياري

  const [imageFile, setImageFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [wordFile, setWordFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)

  async function handleUploadAll() {
    if (!title || !level || !section) {
      alert('املأ المعلومات الأساسية')
      return
    }

    try {
      setLoading(true)

      let image = ''
      let pdf = ''
      let word = ''
      let video = ''

      // PDF
      if (
        section === 'pdf' ||
        section === 'tests' ||
        section === 'exams' ||
        section === 'program' ||
        section === 'guide' ||
        section === 'support'
      ) {
        if (!pdfFile) {
          alert('اختر ملف PDF')
          return
        }
        pdf = await uploadPdf(pdfFile)
      }

      // WORD
      else if (section === 'word') {
        if (!wordFile) {
          alert('اختر ملف Word')
          return
        }
        word = await uploadWord(wordFile)
      }

      // IMAGES
      else if (
        section === 'print' ||
        section === 'draw' ||
        section === 'charts'
      ) {
        if (!imageFile) {
          alert('اختر صورة')
          return
        }
        image = await uploadImage(imageFile)
      }

      // VIDEOS
      else if (section === 'videos') {
        if (!videoFile) {
          alert('اختر فيديو')
          return
        }
        video = await uploadVideo(videoFile)
      }

      const { error } = await supabase.from('lessons').insert([
        {
          title,
          level,
          section,
          image,
          pdf,
          word,
          video,
          youtube: youtubeUrl || null,
        },
      ])

      if (error) {
        alert(error.message)
        return
      }

      alert('تمت إضافة الملف بنجاح')

      setTitle('')
      setLevel('')
      setSection('')
      setYoutubeUrl('')

      setImageFile(null)
      setPdfFile(null)
      setWordFile(null)
      setVideoFile(null)
    } catch (err) {
      console.error('UPLOAD ERROR:', err)

      if (err?.message) {
        alert(err.message)
      } else if (typeof err === 'string') {
        alert(err)
      } else {
        alert(JSON.stringify(err, null, 2))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className="page">
        <h1>لوحة الإدارة</h1>

        {/* فورم رفع الملفات من طرف الأدمن */}
        <div className="card">
          {/* عنوان الملف */}
          <input
            type="text"
            placeholder="عنوان الملف"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <br />
          <br />

          {/* المستوى */}
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
          >
            <option value="">اختر المستوى</option>
            <option value="first">الأولى متوسط</option>
            <option value="second">الثانية متوسط</option>
            <option value="third">الثالثة متوسط</option>
            <option value="fourth">الرابعة متوسط</option>
          </select>

          <br />
          <br />

          {/* القسم */}
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
          >
            <option value="">اختر القسم</option>
            <option value="pdf">مذكرات PDF</option>
            <option value="word">مذكرات Word</option>
            <option value="print">مطبوعات</option>
            <option value="videos">فيديوهات</option>
            <option value="tests">فروض</option>
            <option value="exams">اختبارات</option>
            <option value="draw">رسومات صماء</option>
            <option value="charts">مخططات</option>
            <option value="program">المنهاج</option>
            <option value="guide">الدليل</option>
            <option value="support">المعالجة البيداغوجية</option>
          </select>

          <br />
          <br />

          {/* رابط YouTube اختياري للفيديوهات أو الشروحات */}
          <input
            type="text"
            placeholder="رابط فيديو YouTube (اختياري)"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
          />

          <br />
          <br />

          {/* ملف PDF */}
          {(section === 'pdf' ||
            section === 'tests' ||
            section === 'exams' ||
            section === 'program' ||
            section === 'guide' ||
            section === 'support') && (
            <>
              <label>ملف PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={e => setPdfFile(e.target.files[0])}
              />
              <br />
              <br />
            </>
          )}

          {/* ملف Word */}
          {section === 'word' && (
            <>
              <label>ملف Word</label>
              <input
                type="file"
                accept=".doc,.docx"
                onChange={e => setWordFile(e.target.files[0])}
              />
              <br />
              <br />
            </>
          )}

          {/* صورة */}
          {(section === 'print' ||
            section === 'draw' ||
            section === 'charts') && (
            <>
              <label>الصورة</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
              />
              <br />
              <br />
            </>
          )}

          {/* فيديو */}
          {section === 'videos' && (
            <>
              <label>الفيديو (ملف)</label>
              <input
                type="file"
                accept="video/*"
                onChange={e => setVideoFile(e.target.files[0])}
              />
              <br />
              <br />
            </>
          )}

          <button
            onClick={handleUploadAll}
            disabled={loading}
            style={{
              background: '#1b5e20',
              color: '#fff',
              padding: '12px 25px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            {loading ? 'جاري رفع الملفات...' : 'حفظ الملف'}
          </button>
        </div>

        {/* ملفات الزوار في الانتظار */}
        <AdminUserUploads />
      </div>

      {/* الملفات المرفوعة النهائية */}
      <AdminFiles />

      <Footer />
    </>
  )
}

export default Admin