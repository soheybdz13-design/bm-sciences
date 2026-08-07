import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function UserUpload() {
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [section, setSection] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [email, setEmail] = useState('')

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title || !level || !section) {
      alert('املأ المعلومات الأساسية (العنوان، المستوى، القسم)')
      return
    }

    if (!email) {
      alert('أدخل بريدك الإلكتروني ليصلك إشعار القبول/الرفض')
      return
    }

    if (!file) {
      alert('اختر ملفاً واحداً على الأقل')
      return
    }

    try {
      setLoading(true)

      const ext = file.name.split('.').pop()
      const filePath = `uploads/${Date.now()}.${ext}`

      const { data: storageData, error: storageError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file)

      if (storageError) {
        console.error('STORAGE ERROR:', storageError)
        alert('وقع خطأ أثناء رفع الملف')
        setLoading(false)
        return
      }

      const fileUrl = storageData?.path ? storageData.path : filePath

      const { error } = await supabase
        .from('user_uploads')
        .insert([
          {
            title,
            level,
            section,
            file_url: fileUrl,
            youtube: youtubeUrl || null,
            status: 'pending',
            user_email: email,
          },
        ])

      if (error) {
        console.error(error)
        alert('وقع خطأ أثناء حفظ بيانات الملف')
      } else {
        alert('تم إرسال ملفك للمراجعة، شكراً لك!')

        setTitle('')
        setLevel('')
        setSection('')
        setYoutubeUrl('')
        setEmail('')
        setFile(null)
      }
    } catch (err) {
      console.error(err)
      alert('وقع خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: '30px' }}>
      <h2 style={{ textAlign: 'center' }}>
        أرسل ملفك للموقع (للمراجعة)
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="عنوان الملف"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
        />

        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
        >
          <option value="">اختر المستوى</option>
          <option value="first">الأولى متوسط</option>
          <option value="second">الثانية متوسط</option>
          <option value="third">الثالثة متوسط</option>
          <option value="fourth">الرابعة متوسط</option>
        </select>

        <select
          value={section}
          onChange={e => setSection(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
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

        <input
          type="text"
          placeholder="رابط فيديو YouTube (اختياري)"
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
        />

        <input
          type="email"
          placeholder="بريدك الإلكتروني ليصلك إشعار القبول/الرفض"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
        />

        <label style={{ display: 'block', marginBottom: '5px' }}>
          اختر الملف المناسب (PDF / Word / صورة / فيديو)
        </label>

        <input
          type="file"
          accept=".pdf,.doc,.docx,image/*,video/*"
          onChange={e => setFile(e.target.files[0] || null)}
          style={{ marginBottom: '20px' }}
        />

        <button
          type="submit"
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
          {loading ? 'جاري إرسال الملف...' : 'إرسال الملف للمراجعة'}
        </button>
      </form>
    </div>
  )
}

export default UserUpload