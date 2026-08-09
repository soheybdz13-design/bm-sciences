import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const WORKER_URL = 'https://bm-sciences-upload.soheybdz13.workers.dev'
const TURNSTILE_SITE_KEY = '0x4AAAAAAEKSC4sa6IMYEu-1'

function UserUpload() {
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [section, setSection] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading, setLoading] = useState(false)

  const turnstileRef = useRef(null)
  const widgetId = useRef(null)

  useEffect(() => {
    function renderTurnstile() {
      if (
        !window.turnstile ||
        !turnstileRef.current ||
        widgetId.current !== null
      ) {
        return
      }

      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: token => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      })
    }

    const existingScript = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]'
    )

    if (existingScript) {
      existingScript.addEventListener('load', renderTurnstile)
      renderTurnstile()
      return () => existingScript.removeEventListener('load', renderTurnstile)
    }

    const script = document.createElement('script')
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = renderTurnstile
    document.head.appendChild(script)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title || !level || !section) {
      alert('املأ المعلومات الأساسية: العنوان، المستوى، والقسم')
      return
    }

    if (!email) {
      alert('أدخل بريدك الإلكتروني ليصلك إشعار القبول أو الرفض')
      return
    }

    if (!file) {
      alert('اختر ملفاً واحداً على الأقل')
      return
    }

    if (!turnstileToken) {
      alert('أكمل التحقق الأمني ثم أعد المحاولة')
      return
    }

    try {
      setLoading(true)

      const uploadResponse = await fetch(`${WORKER_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-File-Name': file.name,
          'X-Turnstile-Token': turnstileToken,
        },
        body: file,
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'وقع خطأ أثناء رفع الملف')
      }

      const { error } = await supabase
        .from('user_uploads')
        .insert([
          {
            title,
            level,
            section,
            file_url: uploadResult.key,
            youtube: youtubeUrl || null,
            status: 'pending',
            user_email: email,
          },
        ])

      if (error) {
        console.error(error)
        alert('تم رفع الملف لكن وقع خطأ أثناء حفظ بياناته')
        return
      }

      alert('تم إرسال ملفك للمراجعة، شكراً لك!')

      setTitle('')
      setLevel('')
      setSection('')
      setYoutubeUrl('')
      setEmail('')
      setFile(null)
      setTurnstileToken('')

      if (window.turnstile && widgetId.current !== null) {
        window.turnstile.reset(widgetId.current)
      }
    } catch (err) {
      console.error(err)
      alert(err.message || 'وقع خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: '30px' }}>
      <h2 style={{ textAlign: 'center' }}>
        أرسل ملفك للموقع للمراجعة
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
          placeholder="بريدك الإلكتروني ليصلك إشعار القبول أو الرفض"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
        />

        <label style={{ display: 'block', marginBottom: '5px' }}>
          اختر الملف المناسب: PDF أو Word أو صورة أو فيديو
        </label>

        <input
          type="file"
          accept=".pdf,.doc,.docx,image/*,video/*"
          onChange={e => setFile(e.target.files[0] || null)}
          style={{ marginBottom: '20px' }}
        />

        <div
          ref={turnstileRef}
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
            cursor: loading ? 'not-allowed' : 'pointer',
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