import { useState } from 'react'

const R2_WORKER_URL =
  'https://bm-sciences-upload.soheybdz13.workers.dev'

function getPdfUrl(pdf) {
  if (!pdf) return null

  if (pdf.startsWith('uploads/')) {
    const encodedPath = pdf
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/')

    return `${R2_WORKER_URL}/files/${encodedPath}`
  }

  return pdf
}

function PdfSection({ lessons }) {
  const [selectedPdf, setSelectedPdf] = useState(null)

  function closePreview() {
    setSelectedPdf(null)
  }

  return (
    <>
      <div style={{ marginTop: '20px', direction: 'rtl' }}>
        {lessons.map(lesson => {
          const pdfUrl = getPdfUrl(lesson.pdf)

          return (
            <div
              key={lesson.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 15px',
                marginBottom: '8px',
                background: '#222',
                color: '#fff',
                borderRadius: '8px',
                gap: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '28px',
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    background: '#b71c1c',
                    textAlign: 'center',
                    lineHeight: '28px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  PDF
                </span>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
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
                </div>
              </div>

              {pdfUrl && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPdf({
                        title: lesson.title,
                        url: pdfUrl,
                      })
                    }
                    className="lesson-btn"
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    👁️ معاينة
                  </button>

                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="lesson-btn"
                  >
                    ⬇ تحميل
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedPdf && (
        <div
          onClick={closePreview}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            direction: 'rtl',
          }}
        >
          <div
            onClick={event => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '1250px',
              height: '92vh',
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                background: '#1b5e20',
                color: '#fff',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px',
              }}
            >
              <strong
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedPdf.title}
              </strong>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                }}
              >
                <a
                  href={selectedPdf.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    background: '#1565c0',
                    padding: '8px 12px',
                    borderRadius: '6px',
                  }}
                >
                  ⬇ تحميل
                </a>

                <button
                  type="button"
                  onClick={closePreview}
                  style={{
                    background: '#c62828',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  ✕ إغلاق
                </button>
              </div>
            </div>

            <iframe
              src={`${selectedPdf.url}#toolbar=1&navpanes=0`}
              title={selectedPdf.title}
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                background: '#555',
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default PdfSection