import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AdminFiles from '../components/AdminFiles'
import AdminUserUploads from '../components/AdminUserUploads'
import { supabase } from '../lib/supabaseClient'
import { uploadToR2 } from '../services/uploadToR2'

const ARCHIVE_ACCEPT =
  '.zip,.rar,application/zip,application/x-zip-compressed,application/vnd.rar,application/x-rar-compressed,application/octet-stream'

const PDF_ARCHIVE_ACCEPT =
  `.pdf,application/pdf,${ARCHIVE_ACCEPT}`

const DOCUMENT_ACCEPT =
  `.pdf,.doc,.docx,.ppt,.pptx,.pps,.ppsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow,${ARCHIVE_ACCEPT}`

const sectionConfig = {
  pdf: {
    label: 'ملفات PDF أو ملفات مضغوطة',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  word: {
    label: 'ملفات Word أو ملفات مضغوطة',
    accept:
      `.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,${ARCHIVE_ACCEPT}`,
    column: 'word',
    extensions: ['doc', 'docx', 'zip', 'rar'],
  },

  print: {
    label: 'صور أو PDF أو Word أو PowerPoint أو ملفات مضغوطة',
    accept: `image/*,${DOCUMENT_ACCEPT}`,
    column: 'image',
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
    label: 'ملفات الفيديو أو ملفات مضغوطة',
    accept: `video/*,${ARCHIVE_ACCEPT}`,
    column: 'video',
    extensions: ['mp4', 'webm', 'mov', 'zip', 'rar'],
  },

  ppt: {
    label: 'عروض PowerPoint أو PPS أو ملفات مضغوطة',
    accept:
      `.ppt,.pptx,.pps,.ppsx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow,${ARCHIVE_ACCEPT}`,
    column: 'ppt',
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

  bem: {
    label: 'مواضيع BEM: PDF أو ملفات مضغوطة',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  exercises: {
    label:
      'ملفات PDF أو ملفات مضغوطة للتمارين والوضعيات',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  summaries: {
    label: 'ملفات PDF أو ملفات مضغوطة للملخصات',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  draw: {
    label: 'صور الرسومات الصماء أو ملفات مضغوطة',
    accept: `image/*,${ARCHIVE_ACCEPT}`,
    column: 'image',
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
    label: 'ملفات PDF أو ملفات مضغوطة للمخططات',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  program: {
    label: 'ملفات PDF أو ملفات مضغوطة للمنهاج',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  guide: {
    label: 'ملفات PDF أو ملفات مضغوطة للدليل',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  support: {
    label:
      'ملفات PDF أو ملفات مضغوطة للمعالجة البيداغوجية',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  teacher_documents: {
    label:
      'تقويم تشخيصي ووثائق أخرى: PDF أو Word أو PowerPoint أو ملفات مضغوطة',
    accept: DOCUMENT_ACCEPT,
    column: 'pdf',
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
    label:
      'ملفات PDF أو ملفات مضغوطة للتدرج السنوي',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },

  monthly_distribution: {
    label:
      'ملفات PDF أو ملفات مضغوطة للتوزيع الشهري',
    accept: PDF_ARCHIVE_ACCEPT,
    column: 'pdf',
    extensions: ['pdf', 'zip', 'rar'],
  },
}

const levelShortNames = {
  first: '1 متوسط',
  second: '2 متوسط',
  third: '3 متوسط',
  fourth: '4 متوسط',
}

const termNumbers = {
  term1: '1',
  term2: '2',
  term3: '3',
}

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

function getTitleFromFileName(fileName) {
  return fileName.replace(/\.[^/.]+$/, '')
}

function makeTopicTitle(topicNumber, level, section, term) {
  const sectionLabel =
    section === 'tests' ? 'فروض' : 'اختبارات'

  const termNumber = termNumbers[term] || ''
  const levelName = levelShortNames[level] || ''

  return `النموذج - ${String(topicNumber).padStart(
    2,
    '0'
  )} - ${sectionLabel} الفصل ${termNumber} - علوم الطبيعة والحياة - ${levelName}`
}

function isArchiveFile(fileName) {
  return /\.(zip|rar)$/i.test(fileName || '')
}

function isImageFile(fileName) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(
    fileName || ''
  )
}

function isWordFile(fileName) {
  return /\.(doc|docx)$/i.test(fileName || '')
}

function isPptFile(fileName) {
  return /\.(ppt|pptx|pps|ppsx)$/i.test(fileName || '')
}

function isPdfFile(fileName) {
  return /\.pdf$/i.test(fileName || '')
}

function assignFileToLesson(lesson, section, fileName, fileUrl) {
  if (section === 'print' || section === 'teacher_documents') {
    if (isImageFile(fileName)) {
      lesson.image = fileUrl
    } else if (isPdfFile(fileName)) {
      lesson.pdf = fileUrl
    } else if (isWordFile(fileName)) {
      lesson.word = fileUrl
    } else if (isPptFile(fileName)) {
      lesson.ppt = fileUrl
    } else if (isArchiveFile(fileName)) {
      lesson.archive = fileUrl
    }

    return
  }

  if (isArchiveFile(fileName)) {
    lesson.archive = fileUrl
    return
  }

  lesson[sectionConfig[section].column] = fileUrl
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

  const needsTerm =
    section === 'tests' || section === 'exams'

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
      needsTerm
        ? `سيتم رفع ${files.length} ملفًا في قسم: ${currentConfig.label}.\n\nسيتم ترقيم الملفات تلقائيًا وتسمية كل ملف حسب المستوى والفصل. هل تريد المتابعة؟`
        : `سيتم رفع ${files.length} ملفًا في قسم: ${currentConfig.label}.\n\nكل ملف سيُحفظ باسمه الأصلي. هل تريد المتابعة؟`
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

        let lessonTitle = getTitleFromFileName(file.name)

        if (needsTerm) {
          const { data: topicNumber, error: counterError } =
            await supabase.rpc('next_topic_number', {
              p_level: level,
              p_section: section,
              p_term: term,
            })

          if (counterError) {
            throw new Error(
              `تعذر الحصول على رقم الموضوع التالي: ${counterError.message}`
            )
          }

          lessonTitle = makeTopicTitle(
            topicNumber,
            level,
            section,
            term
          )
        }

        const lesson = {
          title: lessonTitle,
          level,
          section,
          term: needsTerm ? term : null,
          image: '',
          pdf: '',
          word: '',
          video: '',
          ppt: '',
          archive: '',
          youtube: youtubeUrl || null,
        }

        assignFileToLesson(
          lesson,
          section,
          file.name,
          fileUrl
        )

        const { error } = await supabase
          .from('lessons')
          .insert([lesson])

        if (error) {
          throw new Error(error.message)
        }

        uploadResults.push({
          fileName: lessonTitle,
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

    const failedCount =
      uploadResults.length - successCount

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
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            رفع جماعي للملفات
          </h2>

          <select
            value={level}
            disabled={loading}
            onWheel={e => e.currentTarget.blur()}
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
              setFiles([])
              setResults([])
              setFileInputKey(prev => prev + 1)
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
                  setFiles(
                    Array.from(e.target.files || [])
                  )
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
                جاري رفع الملف {progress.current} من{' '}
                {progress.total}
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
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
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

              {results.map((result, index) => (
                <p
                  key={`${result.fileName}-${index}`}
                  style={{
                    color: result.success
                      ? '#1b5e20'
                      : '#c62828',
                    marginBottom: '8px',
                    wordBreak: 'break-word',
                  }}
                >
                  {result.success ? '✓' : '✕'}{' '}
                  {result.fileName}

                  {!result.success &&
                    ` — ${result.error}`}
                </p>
              ))}
            </div>
          )}
        </div>

        <AdminUserUploads />

        <AdminFiles />
      </div>

      <Footer />
    </>
  )
}

export default Admin