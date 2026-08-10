const R2_WORKER_URL =
  'https://bm-sciences-upload.soheybdz13.workers.dev'

function getPptUrl(ppt) {
  if (!ppt) return null

  if (ppt.startsWith('uploads/')) {
    const encodedPath = ppt
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/')

    return `${R2_WORKER_URL}/files/${encodedPath}`
  }

  return ppt
}

function PptSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map(lesson => {
        const pptUrl = getPptUrl(lesson.ppt)

        return (
          <div className="section-card" key={lesson.id}>
            <h3>{lesson.title}</h3>

            {pptUrl ? (
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