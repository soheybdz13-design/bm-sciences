import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const R2_WORKER_URL =
  'https://bm-sciences-upload.soheybdz13.workers.dev'

const sectionLabels = {
  pdf: 'مذكرات PDF',
  word: 'مذكرات Word',
  print: 'مطبوعات',
  videos: 'فيديوهات',
  ppt: 'عروض PPT',
  tests: 'فروض',
  exams: 'اختبارات',
  bem: 'مواضيع BEM',
  exercises: 'تمارين ووضعيات',
  summaries: 'ملخصات',
  draw: 'رسومات صماء',
  charts: 'مخططات',
  program: 'المنهاج',
  guide: 'الدليل',
  support: 'المعالجة البيداغوجية',
  teacher_documents: 'تقويم تشخيصي ووثائق أخرى',
  annual_progression: 'التدرج السنوي',
  monthly_distribution: 'التوزيع الشهري',
}

const pdfSections = [
  'pdf',
  'tests',
  'exams',
  'bem',
  'exercises',
  'summaries',
  'charts',
  'program',
  'guide',
  'support',
  'annual_progression',
  'monthly_distribution',
]

function makeTopicTitle(topicNumber) {
  return `الموضوع رقم ${String(topicNumber).padStart(2, '0')}`
}

function getFileExtension(filePath = '') {
  return filePath
    .split('/')
    .pop()
    ?.split('.')
    .pop()
    ?.toLowerCase() || ''
}

function isArchiveFile(filePath) {
  return /\.(zip|rar)$/i.test(filePath || '')
}

function isImageFile(filePath) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(
    filePath || ''
  )
}

function isWordFile(filePath) {
  return /\.(doc|docx)$/i.test(filePath || '')
}

function isPptFile(filePath) {
  return /\.(ppt|pptx|pps|ppsx)$/i.test(
    filePath || ''
  )
}

function isPdfFile(filePath) {
  return /\.pdf$/i.test(filePath || '')
}

function AdminUserUploads() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    setLoading(true)

    const { data, error } = await supabase
      .from('user_uploads')
      .select('*')
      .eq('status', 'pending')
      .order('id', { ascending: false })

    if (error) {
      console.error('ERROR loading user_uploads:', error)
      alert('وقع خطأ أثناء جلب ملفات الزوار')
    } else {
      setItems(data || [])
    }

    setLoading(false)
  }

  function isR2File(fileUrl) {
    return (fileUrl || '').startsWith('uploads/')
  }

  function getPublicUrl(fileUrl) {
    if (!fileUrl) return null

    if (isR2File(fileUrl)) {
      const encodedPath = fileUrl
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/')

      return `${R2_WORKER_URL}/files/${encodedPath}`
    }

    const { data } = supabase.storage
      .from('user-files')
      .getPublicUrl(fileUrl)

    return data?.publicUrl || null
  }

  async function notifyUser(type, item, reason = '') {
    if (!item.user_email) return

    try {
      await fetch('/.netlify/functions/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          toEmail: item.user_email,
          title: item.title,
          reason,
        }),
      })
    } catch (err) {
      console.error('NOTIFY ERROR:', err)
    }
  }

  function assignFileToLesson(lesson, item, filePath) {
    if (isArchiveFile(filePath)) {
      lesson.archive = filePath
      return
    }

    if (
      item.section === 'print' ||
      item.section === 'teacher_documents'
    ) {
      if (isImageFile(filePath)) {
        lesson.image = filePath
      } else if (isPdfFile(filePath)) {
        lesson.pdf = filePath
      } else if (isWordFile(filePath)) {
        lesson.word = filePath
      } else if (isPptFile(filePath)) {
        lesson.ppt = filePath
      }

      return
    }

    if (pdfSections.includes(item.section)) {
      lesson.pdf = filePath
    } else if (item.section === 'word') {
      lesson.word = filePath
    } else if (item.section === 'draw') {
      lesson.image = filePath
    } else if (item.section === 'videos') {
      lesson.video = filePath
    } else if (item.section === 'ppt') {
      lesson.ppt = filePath
    }
  }

  async function handleApprove(item) {
    const ok = window.confirm(
      `هل تريد قبول هذا الملف وإضافته للموقع؟\nالعنوان الحالي: "${item.title}"`
    )

    if (!ok) return

    try {
      let lessonTitle =
        item.title?.trim() || 'بدون عنوان'

      const isTopic =
        item.section === 'tests' || item.section === 'exams'

      if (isTopic) {
        if (!item.term) {
          alert(
            'هذا الملف تابع للفروض أو الاختبارات، لكنه لا يحتوي على فصل'
          )
          return
        }

        const { data: topicNumber, error: counterError } =
          await supabase.rpc('next_topic_number', {
            p_level: item.level,
            p_section: item.section,
            p_term: item.term,
          })

        if (counterError) {
          alert(
            `تعذر الحصول على رقم الموضوع التالي: ${counterError.message}`
          )
          return
        }

        lessonTitle = makeTopicTitle(topicNumber)
      } else {
        const editedTitle = window.prompt(
          'عدّل عنوان الملف الذي سيظهر في الموقع:',
          lessonTitle
        )

        if (editedTitle === null) return

        if (!editedTitle.trim()) {
          alert('عنوان الملف لا يمكن أن يكون فارغًا')
          return
        }

        lessonTitle = editedTitle.trim()
      }

      const filePath = item.file_url || null

      if (!filePath) {
        alert('الملف غير موجود')
        return
      }

      const lesson = {
        title: lessonTitle,
        level: item.level,
        section: item.section,
        term: item.term || null,
        image: '',
        pdf: '',
        word: '',
        video: '',
        ppt: '',
        archive: '',
        youtube: item.youtube || null,
      }

      assignFileToLesson(lesson, item, filePath)

      const { error: insertError } = await supabase
        .from('lessons')
        .insert([lesson])

      if (insertError) {
        alert(
          `وقع خطأ أثناء إضافة الملف للدروس: ${insertError.message}`
        )
        return
      }

      const { error: updateError } = await supabase
        .from('user_uploads')
        .update({ status: 'approved' })
        .eq('id', item.id)

      if (updateError) {
        alert(
          'تمت إضافة الملف للدروس لكن لم يتم تحديث حالة الطلب'
        )
        return
      }

      await notifyUser('approved', {
        ...item,
        title: lessonTitle,
      })

      setItems(prev =>
        prev.filter(i => i.id !== item.id)
      )

      alert(`تم قبول الملف بنجاح باسم: ${lessonTitle}`)
    } catch (err) {
      console.error('APPROVE ERROR:', err)
      alert('وقع خطأ غير متوقع أثناء قبول الملف')
    }
  }

  async function handleReject(item) {
    const ok = window.confirm(
      `هل تريد رفض هذا الملف؟\nالعنوان: "${item.title}"`
    )

    if (!ok) return

    const reason = window.prompt(
      'اكتب سبب الرفض (اختياري):',
      ''
    )

    try {
      if (item.file_url && !isR2File(item.file_url)) {
        await supabase.storage
          .from('user-files')
          .remove([item.file_url])
      }

      const { error: updateError } = await supabase
        .from('user_uploads')
        .update({
          status: 'rejected',
          reject_reason: reason || null,
        })
        .eq('id', item.id)

      if (updateError) {
        alert('وقع خطأ أثناء تحديث حالة الطلب')
        return
      }

      await notifyUser('rejected', item, reason || '')

      setItems(prev =>
        prev.filter(i => i.id !== item.id)
      )

      alert('تم رفض الملف وحفظ سبب الرفض')
    } catch (err) {
      console.error('REJECT ERROR:', err)
      alert('وقع خطأ غير متوقع أثناء رفض الملف')
    }
  }

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>
        ملفات الزوار في الانتظار
      </h2>

      <button
        onClick={loadPending}
        style={{
          marginBottom: '15px',
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        تحديث القائمة
      </button>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p>لا توجد ملفات في طور المراجعة.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th>العنوان</th>
              <th>المستوى</th>
              <th>القسم</th>
              <th>الملف</th>
              <th>رابط YouTube</th>
              <th>العمليات</th>
            </tr>
          </thead>

          <tbody>
            {items.map(item => {
              const fileUrl = getPublicUrl(item.file_url)

              return (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.level}</td>

                  <td>
                    {sectionLabels[item.section] ||
                      item.section}
                  </td>

                  <td>
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        فتح الملف
                      </a>
                    ) : (
                      'لا يوجد'
                    )}
                  </td>

                  <td>
                    {item.youtube ? (
                      <a
                        href={item.youtube}
                        target="_blank"
                        rel="noreferrer"
                      >
                        فتح الرابط
                      </a>
                    ) : (
                      'لا يوجد'
                    )}
                  </td>

                  <td>
                    <button
                      style={{
                        background: '#1b5e20',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '8px',
                      }}
                      onClick={() => handleApprove(item)}
                    >
                      قبول
                    </button>

                    <button
                      style={{
                        background: 'red',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleReject(item)}
                    >
                      رفض
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminUserUploads