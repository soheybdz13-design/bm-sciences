import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Viewer,
  Worker,
} from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

import { getFileUrl, isArchiveFile } from '../utils/fileUrl'

const PDF_WORKER_URL =
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

function PdfViewer({ pdfUrl }) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  return (
    <Worker workerUrl={PDF_WORKER_URL}>
      <Viewer
        fileUrl={pdfUrl}
        plugins={[defaultLayoutPluginInstance]}
        defaultScale={2}
        renderLoader={() => (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
            }}
          >
            جاري تحميل ملف PDF...
          </div>
        )}
        renderError={error => (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '25px',
              textAlign: 'center',
              color: '#fff',
              gap: '12px',
            }}
          >
            <strong>تعذر عرض ملف PDF.</strong>

            <span style={{ color: '#ffb4b4' }}>
              {error.message}
            </span>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#1565c0',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 15px',
                borderRadius: '7px',
              }}
            >
              فتح الملف مباشرة
            </a>
          </div>
        )}
      />
    </Worker>
  )
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
          const archiveUrl = getFileUrl(lesson.archive)
          const pdfUrl = getFileUrl(lesson.pdf)

          const hasArchive =
            archiveUrl && isArchiveFile(lesson.archive)

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
                flexWrap: 'wrap',
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
                    width: '40px',
                    minWidth: '40px',
                    height: '28px',
                    borderRadius: '4px',
                    background: hasArchive
                      ? '#d97706'
                      : '#b71c1c',
                    textAlign: 'center',
                    lineHeight: '28px',
                    fontWeight: 'bold',
                    fontSize: hasArchive ? '16px' : '12px',
                  }}
                >
                  {hasArchive ? '📦' : 'PDF'}
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

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexShrink: 0,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  to={`/lesson/${lesson.id}`}
                  className="lesson-btn"
                >
                  📄 عرض التفاصيل
                </Link>

                {hasArchive ? (
                  <a
                    href={archiveUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="lesson-btn"
                  >
                    ⬇ تحميل الملف المضغوط
                  </a>
                ) : pdfUrl ? (
                  <>
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
                  </>
                ) : (
                  <span
                    style={{
                      color: '#bbb',
                      fontSize: '14px',
                      alignSelf: 'center',
                    }}
                  >
                    الملف غير متوفر
                  </span>
                )}
              </div>
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
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            direction: 'rtl',
          }}
        >
          <div
            onClick={event => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '1400px',
              height: '94vh',
              background: '#2f2f2f',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                minHeight: '56px',
                background: '#1b5e20',
                color: '#fff',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
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
                  flexShrink: 0,
                }}
              >
                ✕ إغلاق
              </button>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
              }}
            >
              <PdfViewer pdfUrl={selectedPdf.url} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PdfSection