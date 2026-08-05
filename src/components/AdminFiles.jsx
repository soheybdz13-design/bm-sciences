// src/components/AdminFiles.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function AdminFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

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

  // دالة لاستخراج المسار داخل الـbucket من رابط كامل
  function extractPath(fullUrl, bucketName) {
    if (!fullUrl) return null

    const marker = `/${bucketName}/`
    const parts = fullUrl.split(marker)
    if (parts.length < 2) return null

    return parts[1] // الجزء بعد اسم الـbucket
  }

  async function deleteFile(file) {
    const ok = window.confirm(`هل تريد حذف الملف: "${file.title}" ؟`)
    if (!ok) return

    console.log('Trying to delete file with id:', file.id)

    try {
      // حذف PDF من bucket "pdfs"
      const pdfPath = extractPath(file.pdf, 'pdfs')
      if (pdfPath) {
        const { error } = await supabase.storage
          .from('pdfs')
          .remove([pdfPath])
        if (error) {
          console.error('خطأ في حذف PDF:', error)
        } else {
          console.log('PDF deleted from storage:', pdfPath)
        }
      }

      // حذف Word من bucket "words"
      const wordPath = extractPath(file.word, 'words')
      if (wordPath) {
        const { error } = await supabase.storage
          .from('words')
          .remove([wordPath])
        if (error) {
          console.error('خطأ في حذف Word:', error)
        } else {
          console.log('Word deleted from storage:', wordPath)
        }
      }

      // حذف Video من bucket "videos"
      const videoPath = extractPath(file.video, 'videos')
      if (videoPath) {
        const { error } = await supabase.storage
          .from('videos')
          .remove([videoPath])
        if (error) {
          console.error('خطأ في حذف Video:', error)
        } else {
          console.log('Video deleted from storage:', videoPath)
        }
      }

      // حذف Image من bucket "images"
      const imagePath = extractPath(file.image, 'images')
      if (imagePath) {
        const { error } = await supabase.storage
          .from('images')
          .remove([imagePath])
        if (error) {
          console.error('خطأ في حذف Image:', error)
        } else {
          console.log('Image deleted from storage:', imagePath)
        }
      }

      // حذف السجل من قاعدة البيانات
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', file.id)

      if (deleteError) {
        console.error('خطأ في حذف السجل من base:', deleteError)
        alert('حدث خطأ أثناء حذف السجل من قاعدة البيانات')
        return
      }

      // حدّث قائمة الملفات محليًا باش يختفي السطر مباشرة
      setFiles(prev =>
        prev.filter(f => f.id !== file.id)
      )

      alert('تم حذف الملف بنجاح')
    } catch (err) {
      console.error(err)
      alert('حدث خطأ غير متوقع أثناء الحذف')
    }
  }

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>الملفات المرفوعة</h2>

      <button
        onClick={loadFiles}
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
      ) : files.length === 0 ? (
        <p>لا توجد ملفات.</p>
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
              <th>العملية</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.title}</td>
                <td>{file.level}</td>
                <td>{file.section}</td>
                <td>
                  <button
                    style={{
                      background: 'red',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                    onClick={() => deleteFile(file)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminFiles