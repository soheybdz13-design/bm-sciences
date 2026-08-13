import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const WORKER_URL =
  'https://bm-sciences-upload.soheybdz13.workers.dev'

const TURNSTILE_SITE_KEY =
  '0x4AAAAAAEKSC4sa6IMYEu-1'

const ARCHIVE_ACCEPT =
  '.zip,.rar,application/zip,application/x-zip-compressed,application/vnd.rar,application/x-rar-compressed,application/octet-stream'

const DOCUMENT_ACCEPT =
  `.pdf,.doc,.docx,.ppt,.pptx,.pps,.ppsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow,${ARCHIVE_ACCEPT}`

const sectionConfig = {
  pdf: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  word: {
    label: 'Word أو ملف ZIP / RAR',
    accept:
      `.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,${ARCHIVE_ACCEPT}`,
    extensions: ['doc', 'docx', 'zip', 'rar'],
  },
  print: {
    label:
      'صورة أو PDF أو Word أو PowerPoint أو ZIP / RAR',
    accept: `image/*,${DOCUMENT_ACCEPT}`,
    extensions: [
      'jpg',
      'jpeg',
      'png',
      'webp',
      'gif',
      'pdf',
      'doc',
      'docx',
      'ppt',
      'pptx',
      'pps',
      'ppsx',
      'zip',
      'rar',
    ],
  },
  videos: {
    label: 'فيديو أو ملف ZIP / RAR',
    accept: `video/*,${ARCHIVE_ACCEPT}`,
    extensions: ['mp4', 'webm', 'mov', 'zip', 'rar'],
  },
  ppt: {
    label: 'عرض PPT أو PPS أو ملف ZIP / RAR',
    accept:
      `.ppt,.pptx,.pps,.ppsx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow,${ARCHIVE_ACCEPT}`,
    extensions: [
      'ppt',
      'pptx',
      'pps',
      'ppsx',
      'zip',
      'rar',
    ],
  },
  tests: {
    label: 'ملف PDF فقط',
    accept: '.pdf,application/pdf',
    extensions: ['pdf'],
  },
  exams: {
    label: 'ملف PDF فقط',
    accept: '.pdf,application/pdf',
    extensions: ['pdf'],
  },
  bem: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  exercises: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  summaries: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  draw: {
    label: 'صورة أو ملف ZIP / RAR',
    accept: `image/*,${ARCHIVE_ACCEPT}`,
    extensions: [
      'jpg',
      'jpeg',
      'png',
      'webp',
      'gif',
      'zip',
      'rar',
    ],
  },
  charts: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  program: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  guide: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  support: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  teacher_documents: {
    label:
      'وثائق الأستاذ: PDF أو Word أو PowerPoint أو ZIP / RAR',
    accept: DOCUMENT_ACCEPT,
    extensions: [
      'pdf',
      'doc',
      'docx',
      'ppt',
      'pptx',
      'pps',
      'ppsx',
      'zip',
      'rar',
    ],
  },
  annual_progression: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
  monthly_distribution: {
    label: 'PDF أو ملف ZIP / RAR',
    accept: `.pdf,application/pdf,${ARCHIVE_ACCEPT}`,
    extensions: ['pdf', 'zip', 'rar'],
  },
}

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

function UserUpload() {
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [section, setSection] = useState('')
  const [term, setTerm] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)

  const turnstileRef = useRef(null)
  const widgetId = useRef(null)

  const needsTerm =
    section === 'tests' || section === 'exams'

  const currentConfig = sectionConfig[section]

  useEffect(() => {
    function renderTurnstile() {
      if (
        !window.turnstile ||
        !turnstileRef.current ||
        widgetId.current !== null
      ) {
        return
      }

      widgetId.current = window.turnstile.render(
        turnstileRef.current,
        {
          sitekey: TURNSTILE_SITE_KEY,
          callback: token => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        }
      )
    }

    const scriptUrl =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    )

    if (existingScript) {
      existingScript.addEventListener(
        'load',
        renderTurnstile
      )

      renderTurnstile()

      return () => {
        existingScript.removeEventListener(
          'load',
          renderTurnstile
        )
      }
    }

    const script = document.createElement('script')

    script.src = scriptUrl
    script.async = true
    script.defer = true
    script.onload = renderTurnstile

    document.head.appendChild(script)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!level || !section) {
      alert('اختر المستوى والقسم')
      return
    }

    if (!needsTerm && !title.trim()) {
      alert('اكتب عنوان الملف')
      return
    }

    if (needsTerm && !term) {
      alert('اختر الفصل')
      return
    }

    if (!email) {
      alert(
        'أدخل بريدك الإلكتروني ليصلك إشعار القبول أو الرفض'
      )
      return
    }

    if (!file) {
      alert('اختر ملفًا واحدًا')
      return
    }

    if (!currentConfig) {
      alert('القسم المختار غير صالح')
      return
    }

    const extension = getFileExtension(file.name)

    if (!currentConfig.extensions.includes(extension)) {
      alert(
        `هذا الملف لا يناسب القسم المختار.\nالمسموح: ${currentConfig.label}`
      )
      return
    }

    if (!turnstileToken) {
      alert('أكمل التحقق الأمني ثم أعد المحاولة')
      return
    }

    try {
      setLoading(true)

      const uploadResponse = await fetch(
        `${WORKER_URL}/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              file.type || 'application/octet-stream',
            'X-File-Name': encodeURIComponent(file.name),
            'X-Turnstile-Token': turnstileToken,
          },
          body: file,
        }
      )

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(
          uploadResult.error || 'وقع خطأ أثناء رفع الملف'
        )
      }

      const temporaryTitle = needsTerm
        ? 'موضوع'
        : title.trim()

      const { error } = await supabase
        .from('user_uploads')
        .insert([
          {
            title: temporaryTitle,
            level,
            section,
            term: needsTerm ? term : null,
            file_url: uploadResult.key,
            youtube: youtubeUrl || null,
            status: 'pending',
            user_email: email,
          },
        ])

      if (error) {
        throw new Error(
          error.message ||
            'تم رفع الملف لكن وقع خطأ أثناء حفظ بياناته'
        )
      }

      alert('تم إرسال ملفك للمراجعة، شكرًا لك!')

      setTitle('')
      setLevel('')
      setSection('')
      setTerm('')
      setYoutubeUrl('')
      setEmail('')
      setFile(null)
      setTurnstileToken('')
      setFileInputKey(prev => prev + 1)

      if (
        window.turnstile &&
        widgetId.current !== null
      ) {
        window.turnstile.reset(widgetId.current)
      }
    } catch (err) {
      console.error('USER UPLOAD ERROR:', err)
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
        {!needsTerm && (
          <input
            type="text"
            placeholder={
              section === 'bem'
                ? 'عنوان موضوع BEM'
                : 'عنوان الملف'
            }
            value={title}
            disabled={loading}
            onChange={e => setTitle(e.target.value)}
            style={{
              width: '100%',
              marginBottom: '15px',
            }}
          />
        )}

        <select
          value={level}
          disabled={loading}
          onChange={e => {
            const selectedLevel = e.target.value

            setLevel(selectedLevel)

            if (
              selectedLevel !== 'fourth' &&
              section === 'bem'
            ) {
              setSection('')
            }

            if (
              selectedLevel !== 'first' &&
              section === 'support'
            ) {
              setSection('')
            }

            setTerm('')
            setFile(null)
            setFileInputKey(prev => prev + 1)
          }}
          style={{
            width: '100%',
            marginBottom: '15px',
          }}
        >
          <option value="">اختر المستوى</option>
          <option value="first">الأولى متوسط</option>
          <option value="second">الثانية متوسط</option>
          <option value="third">الثالثة متوسط</option>
          <option value="fourth">الرابعة متوسط</option>
        </select>

        <select
          value={section}
          disabled={loading}
          onChange={e => {
            setSection(e.target.value)
            setTerm('')
            setTitle('')
            setFile(null)
            setFileInputKey(prev => prev + 1)
          }}
          style={{
            width: '100%',
            marginBottom: '15px',
          }}
        >
          <option value="">اختر القسم</option>
          <option value="pdf">مذكرات PDF</option>
          <option value="word">مذكرات Word</option>
          <option value="print">مطبوعات</option>
          <option value="videos">فيديوهات</option>
          <option value="ppt">عروض PPT</option>
          <option value="tests">فروض</option>
          <option value="exams">اختبارات</option>

          {level === 'fourth' && (
            <option value="bem">مواضيع BEM</option>
          )}

          <option value="exercises">
            تمارين ووضعيات
          </option>

          <option value="summaries">ملخصات</option>

          <option value="draw">رسومات صماء</option>

          <option value="charts">مخططات</option>

          <option value="program">المنهاج</option>

          <option value="guide">الدليل</option>

          <option value="teacher_documents">
            وثائق الأستاذ
          </option>

          {level === 'first' && (
            <option value="support">
              المعالجة البيداغوجية
            </option>
          )}

          <option value="annual_progression">
            التدرج السنوي
          </option>

          <option value="monthly_distribution">
            التوزيع الشهري
          </option>
        </select>

        {needsTerm && (
          <select
            value={term}
            disabled={loading}
            onChange={e => setTerm(e.target.value)}
            style={{
              width: '100%',
              marginBottom: '15px',
            }}
          >
            <option value="">اختر الفصل</option>
            <option value="term1">الفصل الأول</option>
            <option value="term2">الفصل الثاني</option>
            <option value="term3">الفصل الثالث</option>
          </select>
        )}

        <input
          type="text"
          placeholder="رابط فيديو YouTube (اختياري)"
          value={youtubeUrl}
          disabled={loading}
          onChange={e => setYoutubeUrl(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '15px',
          }}
        />

        <input
          type="email"
          placeholder="بريدك الإلكتروني ليصلك إشعار القبول أو الرفض"
          value={email}
          disabled={loading}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '15px',
          }}
        />

        <label
          style={{
            display: 'block',
            marginBottom: '5px',
          }}
        >
          {currentConfig
            ? `اختر الملف: ${currentConfig.label}`
            : 'اختر القسم أولًا'}
        </label>

        <input
          key={fileInputKey}
          type="file"
          accept={currentConfig?.accept || '*/*'}
          disabled={loading || !currentConfig}
          onChange={e =>
            setFile(e.target.files?.[0] || null)
          }
          style={{ marginBottom: '20px' }}
        />

        {file && (
          <p
            style={{
              marginTop: '-10px',
              marginBottom: '15px',
              color: '#1b5e20',
              wordBreak: 'break-word',
            }}
          >
            الملف المختار: {file.name}
          </p>
        )}

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
            cursor: loading
              ? 'not-allowed'
              : 'pointer',
            fontSize: '18px',
          }}
        >
          {loading
            ? 'جاري إرسال الملف...'
            : 'إرسال الملف للمراجعة'}
        </button>
      </form>
    </div>
  )
}

export default UserUpload