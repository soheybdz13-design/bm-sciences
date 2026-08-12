import { getFileUrl, isArchiveFile } from '../utils/fileUrl'

function ImageSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map(lesson => {
        const archiveUrl = getFileUrl(lesson.archive)
        const imageUrl = getFileUrl(lesson.image)
        const hasArchive = archiveUrl && isArchiveFile(lesson.archive)

        return (
          <div key={lesson.id} className="card">
            {hasArchive ? (
              <>
                <div
                  style={{
                    width: '100%',
                    height: '260px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1f2937',
                    borderRadius: '12px',
                    fontSize: '80px',
                  }}
                >
                  📦
                </div>

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
                    padding: '15px',
                  }}
                >
                  <p
                    style={{
                      textAlign: 'center',
                      marginBottom: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    📦 ملف صور أو مطبوعات مضغوط
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
                {imageUrl ? (
                  <img
                    src={imageUrl}
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
                      height: '260px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#eee',
                      color: '#555',
                      borderRadius: '12px',
                    }}
                  >
                    الصورة غير متوفرة
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

                {imageUrl && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '15px',
                    }}
                  >
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lesson-btn"
                    >
                      🔍 عرض الصورة
                    </a>

                    <a
                      href={imageUrl}
                      download
                      className="lesson-btn"
                    >
                      ⬇ تحميل الصورة
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ImageSection