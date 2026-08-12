import { getFileUrl, isArchiveFile } from '../utils/fileUrl'

function WordSection({ lessons }) {
  return (
    <div style={{ marginTop: '20px' }}>
      {lessons.map(lesson => {
        const archiveUrl = getFileUrl(lesson.archive)
        const wordUrl = getFileUrl(lesson.word)
        const hasArchive = archiveUrl && isArchiveFile(lesson.archive)

        return (
          <div
            key={lesson.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              padding: '10px 15px',
              marginBottom: '8px',
              background: '#222',
              color: '#fff',
              borderRadius: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: hasArchive ? '#d97706' : '#0d47a1',
                  textAlign: 'center',
                  lineHeight: '28px',
                  fontWeight: 'bold',
                }}
              >
                {hasArchive ? '📦' : 'W'}
              </span>

              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {lesson.title}
                </div>

                {lesson.subject && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#ccc',
                    }}
                  >
                    {lesson.subject}
                  </div>
                )}

                {hasArchive && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#fbbf24',
                      marginTop: '3px',
                    }}
                  >
                    ملف مضغوط ZIP أو RAR
                  </div>
                )}
              </div>
            </div>

            {hasArchive ? (
              <a
                href={archiveUrl}
                download
                className="lesson-btn"
              >
                ⬇ تحميل الملف المضغوط
              </a>
            ) : wordUrl ? (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href={wordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lesson-btn"
                >
                  👁️ معاينة
                </a>

                <a
                  href={wordUrl}
                  download
                  className="lesson-btn"
                >
                  ⬇ تحميل
                </a>
              </div>
            ) : (
              <span
                style={{
                  color: '#bbb',
                  fontSize: '14px',
                }}
              >
                الملف غير متوفر
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default WordSection