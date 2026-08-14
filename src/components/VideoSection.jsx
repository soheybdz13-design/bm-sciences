import { Link } from 'react-router-dom'
import { getFileUrl, isArchiveFile } from '../utils/fileUrl'

const titleLinkStyle = {
  color: 'inherit',
  textDecoration: 'none',
}

function VideoSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map(lesson => {
        const archiveUrl = getFileUrl(lesson.archive)
        const videoUrl = getFileUrl(lesson.video)
        const imageUrl = getFileUrl(lesson.image)
        const hasArchive = archiveUrl && isArchiveFile(lesson.archive)

        return (
          <div key={lesson.id} className="card">
            {hasArchive ? (
              <>
                <div
                  style={{
                    minHeight: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1f2937',
                    borderRadius: '10px',
                    fontSize: '62px',
                  }}
                >
                  📦
                </div>

                <h2>
                  <Link
                    to={`/lesson/${lesson.id}`}
                    title="اضغط لعرض تفاصيل الملف"
                    style={titleLinkStyle}
                  >
                    {lesson.title}
                  </Link>
                </h2>

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

                <div style={{ padding: '15px' }}>
                  <p
                    style={{
                      textAlign: 'center',
                      marginBottom: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    ملف فيديو مضغوط
                  </p>

                  <a
                    href={archiveUrl}
                    download
                    className="lesson-btn"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    ⬇ تحميل الملف المضغوط
                  </a>
                </div>
              </>
            ) : (
              <>
                {imageUrl && lesson.image !== 'EMPTY' && (
                  <img
                    src={imageUrl}
                    alt={lesson.title}
                    className="level-image"
                  />
                )}

                <h2>
                  <Link
                    to={`/lesson/${lesson.id}`}
                    title="اضغط لعرض تفاصيل الملف"
                    style={titleLinkStyle}
                  >
                    {lesson.title}
                  </Link>
                </h2>

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

                {videoUrl && lesson.video !== 'EMPTY' && (
                  <video
                    controls
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      marginTop: '15px',
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '15px',
                  }}
                >
                  {videoUrl && lesson.video !== 'EMPTY' ? (
                    <>
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lesson-btn"
                      >
                        ▶ مشاهدة الفيديو في صفحة جديدة
                      </a>

                      <a
                        href={videoUrl}
                        download
                        className="lesson-btn"
                      >
                        ⬇ تحميل الفيديو
                      </a>
                    </>
                  ) : (
                    <p style={{ textAlign: 'center', margin: 0 }}>
                      الفيديو غير متوفر.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default VideoSection