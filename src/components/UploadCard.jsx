import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

async function uploadToBucket(bucket, file) {
  if (!file) return null

  const path = `lessons/${Date.now()}_${file.name}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  if (error) {
    console.error(`خطأ في رفع ${bucket}:`, error)
    throw error
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

function makeTopicTitle(topicNumber) {
  return `الموضوع رقم ${String(topicNumber).padStart(2, '0')}`
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

  const needsTerm = section === 'tests' || section === 'exams'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!level || !section) {
        throw new Error('اختر المستوى والقسم')
      }

      if (!needsTerm && !title.trim()) {
        throw new Error('اكتب عنوان الدرس')
      }

      if (needsTerm && !term) {
        throw new Error('اختر الفصل للفروض أو الاختبارات')
      }

      if (needsTerm && !pdfFile) {
        throw new Error('اختر ملف PDF للفروض أو الاختبارات')
      }

      let finalTitle = title.trim()

      if (needsTerm) {
        const { data: topicNumber, error } = await supabase.rpc(
          'next_topic_number',
          {
            p_level: level,
            p_section: section,
            p_term: term,
          }
        )

        if (error) {
          console.error(
            'ERROR getting next topic number:',
            error
          )
          throw new Error(
            `تعذر الحصول على رقم الموضوع التالي: ${error.message}`
          )
        }

        finalTitle = makeTopicTitle(topicNumber)
      }

      const [pdf, video, image, word] = await Promise.all([
        uploadToBucket('pdfs', pdfFile),
        uploadToBucket('videos', videoFile),
        uploadToBucket('images', imageFile),
        uploadToBucket('words', wordFile),
      ])

      const { error: insertError } = await supabase
        .from('lessons')
        .insert({
          title: finalTitle,
          level,
          section,
          term: needsTerm ? term : null,
          pdf,
          video,
          image,
          word,
        })

      if (insertError) {
        console.error('ERROR inserting into lessons:', insertError)
        throw insertError
      }

      setMessage(
        needsTerm
          ? `تم رفع الملف بنجاح باسم: ${finalTitle} ✅`
          : 'تم رفع الدرس والملفات بنجاح ✅'
      )

      setTitle('')
      setLevel('')
      setSection('')
      setTerm('')
      setPdfFile(null)
      setVideoFile(null)
      setImageFile(null)
      setWordFile(null)
    } catch (err) {
      console.error('UPLOAD ERROR:', err)
      setMessage(
        err.message || 'وقع خطأ أثناء الرفع أو الحفظ ❌'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>رفع درس جديد</h2>

      <form onSubmit={handleSubmit}>
        {!needsTerm && (
          <div style={{ marginBottom: '10px' }}>
            <label>عنوان الدرس</label>
            <input
              type="text"
              value={title}
              disabled={loading}
              onChange={e => setTitle(e.target.value)}
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
            onChange={e => setLevel(e.target.value)}
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
            onChange={e => {
              setSection(e.target.value)
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
        </div>

        {needsTerm && (
          <div style={{ marginBottom: '10px' }}>
            <label>الفصل</label>
            <select
              value={term}
              disabled={loading}
              onChange={e => setTerm(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
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
            type="file"
            accept="application/pdf"
            disabled={loading}
            onChange={e =>
              setPdfFile(e.target.files?.[0] || null)
            }
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>فيديو (اختياري)</label>
          <input
            type="file"
            accept="video/*"
            disabled={loading}
            onChange={e =>
              setVideoFile(e.target.files?.[0] || null)
            }
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>صورة (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            disabled={loading}
            onChange={e =>
              setImageFile(e.target.files?.[0] || null)
            }
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>ملف Word (اختياري)</label>
          <input
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={loading}
            onChange={e =>
              setWordFile(e.target.files?.[0] || null)
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
          }}
        >
          {loading ? 'جارٍ الرفع...' : 'حفظ الدرس والملفات'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '15px',
            fontWeight: 'bold',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}