import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AdminFiles from '../components/AdminFiles'
import AdminUserUploads from '../components/AdminUserUploads'
import { supabase } from '../lib/supabaseClient'
import { uploadToR2 } from '../services/uploadToR2'

const sectionConfig = {
  pdf: {
    label: 'ملفات PDF',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  word: {
    label: 'ملفات Word',
    accept:
      '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    column: 'word',
    extensions: ['doc', 'docx'],
  },
  print: {
    label: 'صور المطبوعات',
    accept: 'image/*',
    column: 'image',
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
  videos: {
    label: 'ملفات الفيديو',
    accept: 'video/*',
    column: 'video',
    extensions: ['mp4', 'webm', 'mov'],
  },
  ppt: {
    label: 'عروض PowerPoint',
    accept:
      '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    column: 'ppt',
    extensions: ['ppt', 'pptx'],
  },
  tests: {
    label: 'ملفات PDF للفروض',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  exams: {
    label: 'ملفات PDF للاختبارات',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  exercises: {
    label: 'ملفات PDF للتمارين والوضعيات',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  summaries: {
    label: 'ملفات PDF للملخصات',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  draw: {
    label: 'صور الرسومات الصماء',
    accept: 'image/*',
    column: 'image',
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
  charts: {
    label: 'ملفات PDF للمخططات',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  program: {
    label: 'ملفات PDF للمنهاج',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  guide: {
    label: 'ملفات PDF للدليل',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  support: {
    label: 'ملفات PDF للمعالجة البيداغوجية',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  annual_progression: {
    label: 'ملفات PDF للتدرج السنوي',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
  monthly_distribution: {
    label: 'ملفات PDF للتوزيع الشهري',
    accept: '.pdf,application/pdf',
    column: 'pdf',
    extensions: ['pdf'],
  },
}

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

function getTitleFromFileName(fileName) {
  return fileName.replace(/\.[^/.]+$/, '')
}

function Admin() {
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState('')
  const [section, setSection] = useState('')
  const [term, setTerm] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [files, setFiles] = useState([])
  const [progress, setProgress] = useState(null)
  const [results, setResults] = useState([])
  const [fileInputKey, setFileInputKey] = useState(0)

  const needsTerm = section === 'tests' || section === 'exams'
  const currentConfig = sectionConfig[section]

  async function handleUploadAll() {
    if (!level || !section) {
      alert('اختر المستوى والقسم')
      return
    }

    if (needsTerm && !term) {
      alert('اختر الفصل')
      return
    }

    if (files.length === 0) {
      alert('اختر ملفًا واحدًا على الأقل')
      return
    }

    if (!currentConfig) {
      alert('القسم المختار غير صالح')
      return
    }

    const invalidFiles = files.filter(file => {
      const extension = getFileExtension(file.name)

      return !currentConfig.extensions.includes(extension)
    })

    if (invalidFiles.length > 0) {
      alert(
        `هذه الملفات لا تناسب القسم المختار:\n${invalidFiles
          .map(file => file.name)
          .join('\n')}`
      )
      return
    }

    const confirmed = window.confirm(
      `سيتم رفع ${files.length} ملفًا في قسم: ${currentConfig.label}.\n\nكل ملف سيُحفظ باسمه الأصلي. هل تريد المتابعة؟`
    )

    if (!confirmed) return

    setLoading(true)
    setResults([])
    setProgress({
      current: 0,
      total: files.length,
      fileName: '',
    })

    const uploadResults = []

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]

      setProgress({
        current: index + 1,
        total: files.length,
        fileName: file.name,
      })

      try {
        const fileUrl = await uploadToR2(file)

        const lesson = {
          title: getTitleFromFileName(file.name),
          level,
          section,
          term: needsTerm ? term : null,
          image: '',
          pdf: '',
          word: '',
          video: '',
          ppt: '',
          youtube: youtubeUrl || null,
        }

        lesson[currentConfig.column] = fileUrl

        const { error } = await supabase
          .from('lessons')
          .insert([lesson])

        if (error) {
          throw new Error(error.message)
        }

        uploadResults.push({
          fileName: file.name,
          success: true,
        })
      } catch (err) {
        console.error('UPLOAD ERROR:', file.name, err)

        uploadResults.push({
          fileName: file.name,
          success: false,
          error: err?.message || 'وقع خطأ غير معروف',
        })
      }

      setResults([...uploadResults])
    }

    const successCount = uploadResults.filter(
      item => item.success
    ).length

    const failedCount = uploadResults.length - successCount

    setLoading(false)
    setProgress(null)

    if (failedCount === 0) {
      alert(`تم رفع وإضافة ${successCount} ملفًا بنجاح`)
      setFiles([])
      setYoutubeUrl('')
      setFileInputKey(prev => prev + 1)
      return
    }

    alert(
      `تم رفع ${successCount} ملفًا بنجاح، وفشل رفع ${failedCount} ملفًا. راجع النتائج أسفل الزر.`
    )
  }

  return (
    <>
      <Navbar />

      <div className="page">
        <h1>لوحة الإدارة</h1>

        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            رفع جماعي للملفات
          </h2>

          <select
            value={level}
            disabled={loading}
            onChange={e => setLevel(e.target.value)}
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
              setFiles([])
              setResults([])
              setFileInputKey(prev => prev + 1)
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
            <option value="exercises">تمارين ووضعيات</option>
            <option value="summaries">ملخصات</option>
            <option value="draw">رسومات صماء</option>
            <option value="charts">مخططات</option>
            <option value="program">المنهاج</option>
            <option value="guide">الدليل</option>
            <option value="support">المعالجة البيداغوجية</option>
            <option value="annual_progression">
              التدرج السنوي
            </option>
            <option value="monthly_distribution">
              التوزيع الشهري
            </option>
          </select>

          {needsTerm && (
            <>
              <label>اختر الفصل</label>

              <select
                value={term}
                disabled={loading}
                onChange={e => setTerm(e.target.value)}
              >
                <option value="">اختر الفصل</option>
                <option value="term1">الفصل الأول</option>
                <option value="term2">الفصل الثاني</option>
                <option value="term3">الفصل الثالث</option>
              </select>
            </>
          )}

          <input
            type="text"
            placeholder="رابط فيديو YouTube اختياري، يضاف لكل الملفات"
            value={youtubeUrl}
            disabled={loading}
            onChange={e => setYoutubeUrl(e.target.value)}
          />

          {currentConfig && (
            <>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                اختر عدة ملفات: {currentConfig.label}
              </label>

              <input
                key={fileInputKey}
                type="file"
                multiple
                accept={currentConfig.accept}
                disabled={loading}
                onChange={e => {
                  setFiles(Array.from(e.target.files || []))
                  setResults([])
                }}
              />

              {files.length > 0 && (
                <p
                  style={{
                    marginTop: '12px',
                    color: '#1b5e20',
                    fontWeight: 'bold',
                  }}
                >
                  تم اختيار {files.length} ملفًا.
                </p>
              )}
            </>
          )}

          {progress && (
            <div
              style={{
                marginTop: '18px',
                padding: '12px',
                background: '#e8f5e9',
                borderRadius: '8px',
                lineHeight: '1.8',
              }}
            >
              <div>
                جاري رفع الملف {progress.current} من {progress.total}
              </div>

              <div style={{ wordBreak: 'break-word' }}>
                {progress.fileName}
              </div>
            </div>
          )}

          <button
            onClick={handleUploadAll}
            disabled={loading || !currentConfig}
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
            {loading
              ? 'جاري رفع الملفات...'
              : 'رفع الملفات المختارة'}
          </button>

          {results.length > 0 && (
            <div style={{ marginTop: '25px' }}>
              <h3 style={{ marginBottom: '10px' }}>
                نتيجة الرفع
              </h3>

              {results.map(result => (
                <p
                  key={result.fileName}
                  style={{
                    color: result.success ? '#1b5e20' : '#c62828',
                    marginBottom: '8px',
                    wordBreak: 'break-word',
                  }}
                >
                  {result.success ? '✓' : '✕'} {result.fileName}
                  {!result.success && ` — ${result.error}`}
                </p>
              ))}
            </div>
          )}
        </div>

        <AdminUserUploads />
      </div>

      <AdminFiles />

      <Footer />
    </>
  )
}

export default Admin