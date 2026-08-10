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
  exercises: 'تمارين ووضعيات',
  summaries: 'ملخصات',
  draw: 'رسومات صماء',
  charts: 'مخططات',
  program: 'المنهاج',
  guide: 'الدليل',
  support: 'المعالجة البيداغوجية',
  annual_progression: 'التدرج السنوي',
  monthly_distribution: 'التوزيع الشهري',
}

const pdfSections = [
  'pdf',
  'tests',
  'exams',
  'exercises',
  'summaries',
  'charts',
  'program',
  'guide',
  'support',
  'annual_progression',
  'monthly_distribution',
]

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

  function getStoragePath(fileUrl) {
    return fileUrl || null
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
        headers: { 'Content-Type': 'application/json' },
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

  async function handleApprove(item) {
    const ok = window.confirm(
      `هل تريد قبول هذا الملف وإضافته للموقع؟\nالعنوان: "${item.title}"`
    )

    if (!ok) return

    try {
      let image = ''
      let pdf = ''
      let word = ''
      let video = ''
      let ppt = ''

      const filePath = getStoragePath(item.file_url)

      if (pdfSections.includes(item.section)) {
        pdf = filePath
      } else if (item.section === 'word') {
        word = filePath
      } else if (
        item.section === 'print' ||
        item.section === 'draw'
      ) {
        image = filePath
      } else if (item.section === 'videos') {
        video = filePath
      } else if (item.section === 'ppt') {
        ppt = filePath
      }

      const { error: insertError } = await supabase
        .from('lessons')
        .insert([
          {
            title: item.title,
            level: item.level,
            section: item.section,
            term: item.term || null,
            image,
            pdf,
            word,
            video,
            ppt,
            youtube: item.youtube || null,
          },
        ])

      if (insertError) {
        console.error('ERROR inserting into lessons:', insertError)
        alert('وقع خطأ أثناء إضافة الملف إلى الدروس')
        return
      }

      const { error: updateError } = await supabase
        .from('user_uploads')
        .update({ status: 'approved' })
        .eq('id', item.id)

      if (updateError) {
        console.error('ERROR updating user_uploads:', updateError)
        alert('تمت إضافة الملف للدروس لكن لم يتم تحديث حالة الطلب')
        return
      }

      await notifyUser('approved', item)

      setItems(prev => prev.filter(i => i.id !== item.id))

      alert('تم قبول الملف وإضافته للموقع بنجاح')
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
      const filePath = getStoragePath(item.file_url)

      if (filePath && !isR2File(filePath)) {
        const { error: storageError } = await supabase.storage
          .from('user-files')
          .remove([filePath])

        if (storageError) {
          console.error(
            'ERROR deleting old Supabase file:',
            storageError
          )
        }
      }

      const { error: updateError } = await supabase
        .from('user_uploads')
        .update({
          status: 'rejected',
          reject_reason: reason || null,
        })
        .eq('id', item.id)

      if (updateError) {
        console.error(
          'ERROR updating user_uploads (reject):',
          updateError
        )
        alert('وقع خطأ أثناء تحديث حالة الطلب')
        return
      }

      await notifyUser('rejected', item, reason || '')

      setItems(prev => prev.filter(i => i.id !== item.id))

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
                    {sectionLabels[item.section] || item.section}
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
                        width: 'auto',
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
                        width: 'auto',
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