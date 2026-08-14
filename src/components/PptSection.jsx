import { Link } from 'react-router-dom'
import { getFileUrl, isArchiveFile } from '../utils/fileUrl'

function PptSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map(lesson => {
        const archiveUrl = getFileUrl(lesson.archive)
        const pptUrl = getFileUrl(lesson.ppt)
        const hasArchive = archiveUrl && isArchiveFile(lesson.archive)

        return (
          <div className="section-card" key={lesson.id}>
            <h3>
              <Link
                to={`/lesson/${lesson.id}`}
                title="اضغط لعرض تفاصيل الملف"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                {lesson.title}
              </Link>
            </h3>

            {hasArchive ? (
              <div style={{ marginTop: '16px' }}>
                <p
                  style={{
                    marginBottom: '14px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  📦 ملف مضغوط
                </p>

                <a
                  href={archiveUrl}
                  download
                  className="lesson-btn"
                  style={{
                    display: 'inline-block',
                    textDecoration: 'none',
                  }}
                >
                  ⬇ تحميل الملف المضغوط
                </a>
              </div>
            ) : pptUrl ? (
              <a
                href={pptUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  background: '#d24726',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                فتح أو تحميل العرض
              </a>
            ) : (
              <p>العرض غير متوفر.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default PptSection