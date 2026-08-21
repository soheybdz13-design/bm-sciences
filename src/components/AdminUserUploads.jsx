import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const R2_WORKER_URL =
  'https://upload.cem-sciences.com'

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
  const [processingId, setProcessingId] = useState(null)

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
    if (!item.user_email) {
      return {
        success: false,
        message: 'لا يوجد بريد إلكتروني للزائر',
      }
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error(
          'انتهت جلسة الإدارة، أعد تسجيل الدخول'
        )
      }

      const response = await fetch(
        `${R2_WORKER_URL}/admin-notify-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            type,
            toEmail: item.user_email,
            title: item.title,
            reason,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'تعذر إرسال البريد الإلكتروني'
        )
      }

      return {
        success: true,
        message: result.message || 'تم إرسال البريد بنجاح',
      }
    } catch (err) {
      console.error('NOTIFY ERROR:', err)

      return {
        success: false,
        message:
          err.message || 'تعذر إرسال البريد الإلكتروني',
      }
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
      setProcessingId(item.id)

      let lessonTitle =
        item.title?.trim() || 'بدون عنوان'

      const isTopic =
        item.section === 'tests' ||
        item.section === 'exams'

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

      const notification = await notifyUser(
        'approved',
        {
          ...item,
          title: lessonTitle,
        }
      )

      setItems(prev =>
        prev.filter(i => i.id !== item.id)
      )

      if (notification.success) {
        alert(
          `تم قبول الملف بنجاح باسم: ${lessonTitle}\nتم إرسال إشعار القبول إلى الزائر ✅`
        )
      } else {
        alert(
          `تم قبول الملف بنجاح باسم: ${lessonTitle}\nلكن تعذر إرسال الإيميل: ${notification.message}`
        )
      }
    } catch (err) {
      console.error('APPROVE ERROR:', err)
      alert('وقع خطأ غير متوقع أثناء قبول الملف')
    } finally {
      setProcessingId(null)
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
      setProcessingId(item.id)

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

      const notification = await notifyUser(
        'rejected',
        item,
        reason || ''
      )

      setItems(prev =>
        prev.filter(i => i.id !== item.id)
      )

      if (notification.success) {
        alert(
          'تم رفض الملف وحفظ سبب الرفض.\nتم إرسال إشعار الرفض إلى الزائر ✅'
        )
      } else {
        alert(
          `تم رفض الملف وحفظ سبب الرفض.\nلكن تعذر إرسال الإيميل: ${notification.message}`
        )
      }
    } catch (err) {
      console.error('REJECT ERROR:', err)
      alert('وقع خطأ غير متوقع أثناء رفض الملف')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>
        ملفات الزوار في الانتظار
      </h2>

      <button
        onClick={loadPending}
        disabled={loading}
        style={{
          marginBottom: '15px',
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        تحديث القائمة
      </button>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p>لا توجد ملفات في طور المراجعة.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '760px',
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
                const isProcessing =
                  processingId === item.id

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
                        type="button"
                        disabled={isProcessing}
                        style={{
                          background: '#1b5e20',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: isProcessing
                            ? 'not-allowed'
                            : 'pointer',
                          opacity: isProcessing ? 0.6 : 1,
                          marginRight: '8px',
                        }}
                        onClick={() => handleApprove(item)}
                      >
                        {isProcessing
                          ? 'جاري المعالجة...'
                          : 'قبول'}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        style={{
                          background: '#c62828',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: isProcessing
                            ? 'not-allowed'
                            : 'pointer',
                          opacity: isProcessing ? 0.6 : 1,
                        }}
                        onClick={() => handleReject(item)}
                      >
                        {isProcessing
                          ? 'جاري المعالجة...'
                          : 'رفض'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminUserUploads