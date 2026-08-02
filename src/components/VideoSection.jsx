// src/components/VideoSection.jsx
function VideoSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map(lesson => (
        <div key={lesson.id} className="card">
          {/* صورة مصغّرة إن وجدت */}
          {lesson.image && lesson.image !== 'EMPTY' && (
            <img
              src={lesson.image}
              alt={lesson.title}
              className="level-image"
            />
          )}

          {/* عنوان الفيديو */}
          <h2>{lesson.title}</h2>

          {/* وصف اختياري */}
          {lesson.description && (
            <p
              style={{
                padding: '10px 20px',
                textAlign: 'center',
              }}
            >
              {lesson.description}
            </p>
          )}

          {/* مشغل الفيديو داخل البطاقة */}
          {lesson.video && lesson.video !== 'EMPTY' && (
            <video
              controls
              style={{
                width: '100%',
                borderRadius: '10px',
                marginTop: '15px',
              }}
            >
              <source src={lesson.video} type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
          )}

          {/* أزرار المشاهدة والتحميل */}
          {lesson.video && lesson.video !== 'EMPTY' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '15px',
              }}
            >
              <a
                href={lesson.video}
                target="_blank"
                rel="noopener noreferrer"
                className="lesson-btn"
              >
                ▶ مشاهدة الفيديو في صفحة جديدة
              </a>

              <a
                href={lesson.video}
                download
                className="lesson-btn"
              >
                ⬇ تحميل الفيديو
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default VideoSection