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

function AdminFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadFiles()
  }, [])

  async function loadFiles() {
    setLoading(true)

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      alert('وقع خطأ أثناء جلب الملفات')
    } else {
      setFiles(data || [])
    }

    setLoading(false)
  }

  function extractLegacyStoragePath(fullUrl, bucketName) {
    if (!fullUrl) return null

    const marker = `/${bucketName}/`
    const parts = fullUrl.split(marker)

    if (parts.length < 2) return null

    return parts[1]
  }

  function getR2Key(fileValue) {
    if (!fileValue) return null

    if (fileValue.startsWith('uploads/')) {
      return fileValue
    }

    try {
      const url = new URL(fileValue)
      const marker = '/files/'

      if (!url.pathname.startsWith(marker)) {
        return null
      }

      return decodeURIComponent(
        url.pathname.slice(marker.length)
      )
    } catch {
      return null
    }
  }

  function getFileValue(file) {
    return (
      file.pdf ||
      file.word ||
      file.image ||
      file.video ||
      file.ppt ||
      null
    )
  }

  async function deleteR2File(key) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error('انتهت جلسة الإدارة. أعد تسجيل الدخول.')
    }

    const response = await fetch(
      `${R2_WORKER_URL}/admin-delete?key=${encodeURIComponent(key)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || 'تعذر حذف الملف من R2.'
      )
    }
  }

  async function deleteLegacyStorageFile(
    fileValue,
    bucketName
  ) {
    const path = extractLegacyStoragePath(
      fileValue,
      bucketName
    )

    if (!path) return

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      console.error(
        `خطأ في حذف الملف من bucket ${bucketName}:`,
        error
      )
    }
  }

  async function deleteFile(file) {
    const ok = window.confirm(
      `هل تريد حذف الملف نهائيًا؟\n\n${file.title}`
    )

    if (!ok) return

    try {
      setDeletingId(file.id)

      const fileValue = getFileValue(file)
      const r2Key = getR2Key(fileValue)

      if (r2Key) {
        await deleteR2File(r2Key)
      } else {
        await deleteLegacyStorageFile(file.pdf, 'pdfs')
        await deleteLegacyStorageFile(file.word, 'words')
        await deleteLegacyStorageFile(file.video, 'videos')
        await deleteLegacyStorageFile(file.image, 'images')
      }

      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', file.id)

      if (deleteError) {
        throw new Error(
          `تم حذف الملف من التخزين، لكن تعذر حذف سجله: ${deleteError.message}`
        )
      }

      setFiles(prev =>
        prev.filter(currentFile => currentFile.id !== file.id)
      )

      alert('تم حذف الملف والسجل بنجاح')
    } catch (err) {
      console.error('DELETE ERROR:', err)
      alert(
        err.message || 'حدث خطأ غير متوقع أثناء الحذف'
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>
        الملفات المرفوعة
      </h2>

      <button
        onClick={loadFiles}
        disabled={loading}
        style={{
          marginBottom: '15px',
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '6px',
          cursor: 'pointer',
          width: 'auto',
        }}
      >
        تحديث القائمة
      </button>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : files.length === 0 ? (
        <p>لا توجد ملفات.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
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
                <th>العملية</th>
              </tr>
            </thead>

            <tbody>
              {files.map(file => (
                <tr key={file.id}>
                  <td>{file.title}</td>
                  <td>{file.level}</td>
                  <td>
                    {sectionLabels[file.section] ||
                      file.section}
                  </td>
                  <td>
                    <button
                      style={{
                        background: 'red',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '6px',
                        cursor:
                          deletingId === file.id
                            ? 'not-allowed'
                            : 'pointer',
                        width: 'auto',
                      }}
                      disabled={deletingId === file.id}
                      onClick={() => deleteFile(file)}
                    >
                      {deletingId === file.id
                        ? 'جاري الحذف...'
                        : 'حذف'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminFiles