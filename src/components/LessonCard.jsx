// src/components/LessonCard.jsx

// دالة لاستخراج رابط embed من رابط YouTube عادي
function getYoutubeEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) return null

  const match = youtubeUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  const id = match ? match[1] : null
  if (!id) return null

  return `https://www.youtube.com/embed/${id}`
}

function LessonCard({ lesson }) {
  const youtubeEmbed = getYoutubeEmbedUrl(lesson.youtube)

  return (
    <div
      className="card"
      style={{ marginBottom: '20px', padding: '15px' }}
    >
      <h3>{lesson.title}</h3>
      <p>
        المستوى: <strong>{lesson.level}</strong> – القسم:{' '}
        <strong>{lesson.section}</strong>
      </p>

      {/* معاينة الصورة + تحميل */}
      {lesson.image && (
        <div style={{ marginTop: '10px' }}>
          <h4>الصورة</h4>
          <img
            src={lesson.image}
            alt={lesson.title}
            style={{ maxWidth: '300px', display: 'block' }}
          />
          <a
            href={lesson.image}
            target="_blank"
            rel="noopener noreferrer"
          >
            تحميل الصورة
          </a>
        </div>
      )}

      {/* معاينة PDF داخل الموقع + تحميل */}
      {lesson.pdf && (
        <div style={{ marginTop: '10px' }}>
          <h4>ملف PDF</h4>
          <iframe
            src={lesson.pdf}
            title={lesson.title}
            style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
          />
          <br />
          <a
            href={`${lesson.pdf}?download`}
            target="_blank"
            rel="noopener noreferrer"
          >
            تحميل PDF
          </a>
        </div>
      )}

      {/* Word: رابط فتح/تحميل */}
      {lesson.word && (
        <div style={{ marginTop: '10px' }}>
          <h4>ملف Word</h4>
          <a
            href={lesson.word}
            target="_blank"
            rel="noopener noreferrer"
          >
            فتح / تحميل ملف Word
          </a>
        </div>
      )}

      {/* فيديو YouTube داخل الموقع */}
      {youtubeEmbed && (
        <div style={{ marginTop: '10px' }}>
          <h4>فيديو YouTube</h4>
          <iframe
            width="560"
            height="315"
            src={youtubeEmbed}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      {/* زر تحميل مباشر للفيديو من Supabase */}
      {lesson.video && (
        <div style={{ marginTop: '10px' }}>
          <h4>الفيديو (ملف مخزّن)</h4>
          <a
            href={`${lesson.video}?download`}
            target="_blank"
            rel="noopener noreferrer"
          >
            تحميل الفيديو مباشرة
          </a>
        </div>
      )}
    </div>
  )
}

export default LessonCard