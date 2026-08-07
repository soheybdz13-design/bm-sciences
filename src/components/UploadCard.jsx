import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// دالة مساعدة لرفع ملف إلى bucket معيّن
async function uploadToBucket(bucket, file) {
  if (!file) return null

  const path = `lessons/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase
    .storage
    .from(bucket)
    .upload(path, file)

  if (uploadError) {
    console.error(`خطأ في رفع ${bucket}:`, uploadError)
    throw uploadError
  }

  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export default function UploadCard() {
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [section, setSection] = useState('')

  const [pdfFile, setPdfFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [wordFile, setWordFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const pdfUrl = await uploadToBucket('pdfs', pdfFile)
      const videoUrl = await uploadToBucket('videos', videoFile)
      const imageUrl = await uploadToBucket('images', imageFile)
      const wordUrl = await uploadToBucket('words', wordFile)

      const { error: insertError } = await supabase
        .from('lessons')
        .insert({
          title: title.trim(),
          level,
          section,
          pdf: pdfUrl,
          video: videoUrl,
          image: imageUrl,
          word: wordUrl,
        })

      if (insertError) {
        console.error(insertError)
        throw insertError
      }

      setMessage('تم رفع الدرس والملفات بنجاح ✅')

      setTitle('')
      setLevel('')
      setSection('')
      setPdfFile(null)
      setVideoFile(null)
      setImageFile(null)
      setWordFile(null)
    } catch (err) {
      console.error(err)
      setMessage('وقع خطأ أثناء الرفع أو الحفظ ❌')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>رفع درس جديد</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>عنوان الدرس</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="مثال: تمارين حول التغذية عند الإنسان"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>المستوى</label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">اختر المستوى</option>
            <option value="first">الأولى متوسط</option>
            <option value="second">الثانية متوسط</option>
            <option value="third">الثالثة متوسط</option>
            <option value="fourth">الرابعة متوسط</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>القسم</label>
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">اختر القسم</option>
            <option value="pdf">مذكرات PDF</option>
            <option value="word">مذكرات Word</option>
            <option value="print">مطبوعات</option>
            <option value="videos">فيديوهات</option>
            <option value="tests">فروض</option>
            <option value="exams">اختبارات</option>
            <option value="exercises">تمارين ووضعيات</option>
            <option value="summaries">ملخصات</option>
            <option value="draw">رسومات صماء</option>
            <option value="charts">مخططات</option>
            <option value="program">المنهاج</option>
            <option value="guide">الدليل</option>
            <option value="support">المعالجة البيداغوجية</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>ملف PDF (اختياري)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setPdfFile(e.target.files[0])}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>فيديو (اختياري)</label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files[0])}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>صورة (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>ملف Word (اختياري)</label>
          <input
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={e => setWordFile(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'جارٍ الرفع...' : 'حفظ الدرس والملفات'}
        </button>
      </form>

      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  )
}