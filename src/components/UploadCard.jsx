import { useRef, useState } from 'react'
import { createAdminLesson } from '../api'
import { uploadToR2 } from '../services/uploadToR2'

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

const levelLabels = {
  first: 'السنة الأولى متوسط',
  second: 'السنة الثانية متوسط',
  third: 'السنة الثالثة متوسط',
  fourth: 'السنة الرابعة متوسط',
}

const topicSectionLabels = {
  tests: 'فرض',
  exams: 'اختبار',
}

const termLabels = {
  term1: 'الفصل الأول',
  term2: 'الفصل الثاني',
  term3: 'الفصل الثالث',
}

function makeTopicTitle(topicNumber, level, section, term) {
  const formattedNumber = String(topicNumber).padStart(
    2,
    '0'
  )

  return (
    `النموذج رقم ${formattedNumber} - ` +
    `${topicSectionLabels[section]} ${termLabels[term]} ` +
    `في علوم الطبيعة والحياة - ${levelLabels[level]}`
  )
}

function getArabicTopicNumber(title = '') {
  const match = String(title).match(/رقم\s*([0-9٠-٩]+)/)

  if (!match) {
    return 0
  }

  const westernDigits = match[1].replace(
    /[٠-٩]/g,
    digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)
  )

  return Number(westernDigits) || 0
}

function isAllowedFile(file, allowedExtensions) {
  if (!file) {
    return true
  }

  const extension =
    file.name.split('.').pop()?.toLowerCase() || ''

  return allowedExtensions.includes(extension)
}

export default function UploadCard() {
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('')
  const [section, setSection] = useState('')
  const [term, setTerm] = useState('')

  const [pdfFile, setPdfFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [wordFile, setWordFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const pdfInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const wordInputRef = useRef(null)

  const needsTerm =
    section === 'tests' || section === 'exams'

  function resetForm() {
    setTitle('')
    setLevel('')
    setSection('')
    setTerm('')
    setPdfFile(null)
    setVideoFile(null)
    setImageFile(null)
    setWordFile(null)

    if (pdfInputRef.current) {
      pdfInputRef.current.value = ''
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }

    if (wordInputRef.current) {
      wordInputRef.current.value = ''
    }
  }

  function validateFile(file, label, extensions) {
    if (!file) {
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `${label}: حجم الملف أكبر من الحد الأقصى 100 MB.`
      )
    }

    if (!isAllowedFile(file, extensions)) {
      throw new Error(
        `${label}: نوع الملف غير مسموح.`
      )
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      if (!level || !section) {
        throw new Error('اختر المستوى والقسم.')
      }

      if (!needsTerm && !title.trim()) {
        throw new Error('اكتب عنوان الدرس.')
      }

      if (needsTerm && !term) {
        throw new Error(
          'اختر الفصل للفروض أو الاختبارات.'
        )
      }

      if (needsTerm && !pdfFile) {
        throw new Error(
          'اختر ملف PDF للفروض أو الاختبارات.'
        )
      }

      validateFile(
        pdfFile,
        'ملف PDF',
        ['pdf']
      )

      validateFile(
        videoFile,
        'ملف الفيديو',
        ['mp4', 'webm', 'mov']
      )

      validateFile(
        imageFile,
        'ملف الصورة',
        ['jpg', 'jpeg', 'png', 'webp', 'gif']
      )

      validateFile(
        wordFile,
        'ملف Word',
        ['doc', 'docx']
      )

      let finalTitle = title.trim()

      if (needsTerm) {
        const existingLessons = await import('../api').then(
          module =>
            module.getLessonsByLevel(level, section, term)
        )

        const lastTopicNumber = (existingLessons || []).reduce(
          (maximum, lesson) =>
            Math.max(
              maximum,
              getArabicTopicNumber(lesson.title)
            ),
          0
        )

        finalTitle = makeTopicTitle(
          lastTopicNumber + 1,
          level,
          section,
          term
        )
      }

      const [pdf, video, image, word] = await Promise.all([
        pdfFile ? uploadToR2(pdfFile) : Promise.resolve(null),
        videoFile
          ? uploadToR2(videoFile)
          : Promise.resolve(null),
        imageFile
          ? uploadToR2(imageFile)
          : Promise.resolve(null),
        wordFile
          ? uploadToR2(wordFile)
          : Promise.resolve(null),
      ])

      await createAdminLesson({
        title: finalTitle,
        level,
        section,
        term: needsTerm ? term : null,
        pdf: pdf || '',
        video: video || '',
        image: image || '',
        word: word || '',
        status: 'approved',
      })

      setMessageType('success')
      setMessage(
        needsTerm
          ? `تم رفع وحفظ الملف بنجاح باسم:\n${finalTitle} ✅`
          : 'تم رفع الدرس وحفظ الملفات بنجاح ✅'
      )

      resetForm()
    } catch (error) {
      console.error('ADMIN UPLOAD ERROR:', error)

      setMessageType('error')
      setMessage(
        error.message ||
          'وقع خطأ أثناء رفع الملفات أو حفظ الدرس.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>
        رفع درس جديد
      </h2>

      <form onSubmit={handleSubmit}>
        {!needsTerm && (
          <div style={{ marginBottom: '10px' }}>
            <label>عنوان الدرس</label>

            <input
              type="text"
              value={title}
              disabled={loading}
              onChange={event =>
                setTitle(event.target.value)
              }
              placeholder="مثال: تمارين حول التغذية عند الإنسان"
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label>المستوى</label>

          <select
            value={level}
            disabled={loading}
            onChange={event => {
              const selectedLevel = event.target.value

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
            }}
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
            disabled={loading}
            onChange={event => {
              setSection(event.target.value)
              setTerm('')
            }}
            required
            style={{ width: '100%', padding: '8px' }}
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
              تقويم تشخيصي ووثائق أخرى
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
        </div>

        {needsTerm && (
          <div style={{ marginBottom: '10px' }}>
            <label>الفصل</label>

            <select
              value={term}
              disabled={loading}
              onChange={event =>
                setTerm(event.target.value)
              }
              required
              style={{
                width: '100%',
                padding: '8px',
              }}
            >
              <option value="">اختر الفصل</option>
              <option value="term1">الفصل الأول</option>
              <option value="term2">الفصل الثاني</option>
              <option value="term3">الفصل الثالث</option>
            </select>
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label>
            ملف PDF {needsTerm ? '(إجباري)' : '(اختياري)'}
          </label>

          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            disabled={loading}
            onChange={event =>
              setPdfFile(event.target.files?.[0] || null)
            }
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>فيديو (اختياري)</label>

          <input
            ref={videoInputRef}
            type="file"
            accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
            disabled={loading}
            onChange={event =>
              setVideoFile(event.target.files?.[0] || null)
            }
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>صورة (اختياري)</label>

          <input
            ref={imageInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
            disabled={loading}
            onChange={event =>
              setImageFile(event.target.files?.[0] || null)
            }
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>ملف Word (اختياري)</label>

          <input
            ref={wordInputRef}
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={loading}
            onChange={event =>
              setWordFile(event.target.files?.[0] || null)
            }
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
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? 'جارٍ الرفع والحفظ...'
            : 'حفظ الدرس والملفات'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '15px',
            fontWeight: 'bold',
            whiteSpace: 'pre-line',
            color:
              messageType === 'success'
                ? '#1b5e20'
                : '#c62828',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}