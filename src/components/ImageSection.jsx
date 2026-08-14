import { Link } from 'react-router-dom'
import { getFileUrl, isArchiveFile } from '../utils/fileUrl'

function getExtension(filePath = '') {
  return (
    filePath
      .split('?')[0]
      .split('#')[0]
      .split('.')
      .pop()
      ?.toLowerCase() || ''
  )
}

function getLessonFile(lesson) {
  if (lesson.archive) {
    return {
      type: 'archive',
      url: getFileUrl(lesson.archive),
      label: '📦 ملف مضغوط',
      button: '⬇ تحميل الملف المضغوط',
    }
  }

  if (lesson.image) {
    return {
      type: 'image',
      url: getFileUrl(lesson.image),
      label: 'صورة',
      button: '⬇ تحميل الصورة',
    }
  }

  if (lesson.pdf) {
    return {
      type: 'pdf',
      url: getFileUrl(lesson.pdf),
      label: '📄 ملف PDF',
      button: '⬇ تحميل PDF',
    }
  }

  if (lesson.word) {
    return {
      type: 'word',
      url: getFileUrl(lesson.word),
      label: '📝 ملف Word',
      button: '⬇ تحميل ملف Word',
    }
  }

  if (lesson.ppt) {
    return {
      type: 'ppt',
      url: getFileUrl(lesson.ppt),
      label: '📊 عرض PowerPoint',
      button: '⬇ تحميل العرض',
    }
  }

  return null
}

function ImageSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map(lesson => {
        const file = getLessonFile(lesson)

        const isImage =
          file?.type === 'image' &&
          !isArchiveFile(lesson.image)

        const fileExtension = getExtension(
          lesson.image ||
            lesson.pdf ||
            lesson.word ||
            lesson.ppt ||
            lesson.archive
        )

        return (
          <div key={lesson.id} className="card">
            {isImage && file?.url ? (
              <img
                src={file.url}
                alt={lesson.title}
                style={{
                  width: '100%',
                  height: '260px',
                  objectFit: 'contain',
                  background: '#fff',
                  borderRadius: '12px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '210px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '70px' }}>
                  {file?.type === 'archive'
                    ? '📦'
                    : file?.type === 'pdf'
                      ? '📄'
                      : file?.type === 'word'
                        ? '📝'
                        : file?.type === 'ppt'
                          ? '📊'
                          : '📁'}
                </span>

                {fileExtension && (
                  <span
                    style={{
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {fileExtension}
                  </span>
                )}
              </div>
            )}

            <h2
              style={{
                marginTop: '15px',
                textAlign: 'center',
              }}
            >
              {lesson.title}
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

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '15px',
              }}
            >
              <Link
                to={`/lesson/${lesson.id}`}
                className="lesson-btn"
              >
                📄 عرض التفاصيل
              </Link>

              {file?.url ? (
                <>
                  {!isImage && (
                    <p
                      style={{
                        margin: 0,
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {file.label}
                    </p>
                  )}

                  {isImage && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lesson-btn"
                    >
                      🔍 عرض الصورة
                    </a>
                  )}

                  {(file.type === 'pdf' ||
                    file.type === 'word' ||
                    file.type === 'ppt') && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lesson-btn"
                    >
                      👁️ فتح الملف
                    </a>
                  )}

                  <a
                    href={file.url}
                    download
                    className="lesson-btn"
                  >
                    {file.button}
                  </a>
                </>
              ) : (
                <p
                  style={{
                    margin: 0,
                    textAlign: 'center',
                    color: '#777',
                  }}
                >
                  الملف غير متوفر.
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ImageSection