import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  FaEye,
  FaDownload,
  FaCalendarAlt,
  FaFilePdf,
  FaSearch,
} from 'react-icons/fa'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PdfViewer from '../components/PdfViewer'
import { getLessonsByLevel } from '../api'
import { getFileUrl } from '../utils/fileUrl'

import './Lessons.css'

function Lessons() {
  const { level } = useParams()

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadLessons()
  }, [level])

  async function loadLessons() {
    setLoading(true)

    try {
      const data = await getLessonsByLevel(level)

      const sortedLessons = [...(data || [])].sort((a, b) => {
        const yearA = Number(a.year) || 0
        const yearB = Number(b.year) || 0

        if (yearA !== yearB) {
          return yearB - yearA
        }

        return Number(b.id) - Number(a.id)
      })

      setLessons(sortedLessons)
    } catch (error) {
      console.error(error)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  const filteredLessons = lessons.filter(lesson =>
    (lesson.title || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />

      <div className="lessons-container">
        <h1 className="page-title">{level}</h1>

        <h2 className="page-subtitle">جميع ملفات PDF</h2>

        <div className="search-box">
          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="ابحث عن ملف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading">جاري تحميل الملفات...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="loading">
            لا توجد ملفات مطابقة للبحث.
          </div>
        ) : (
          <div className="files-list">
            {filteredLessons.map(lesson => {
              const pdfUrl = getFileUrl(lesson.pdf)

              return (
                <div key={lesson.id} className="file-row">
                  <div className="file-year">
                    <FaCalendarAlt />
                    {lesson.year || '—'}
                  </div>

                  <div className="file-info">
                    <h3>
                      <FaFilePdf
                        style={{
                          color: '#e53935',
                          marginLeft: '8px',
                        }}
                      />
                      {lesson.title}
                    </h3>

                    {lesson.subject && <p>{lesson.subject}</p>}
                  </div>

                  <div className="file-actions">
                    {pdfUrl ? (
                      <>
                        <button
                          className="preview-btn"
                          onClick={() => setSelectedPdf(pdfUrl)}
                        >
                          <FaEye />
                          معاينة PDF
                        </button>

                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-btn"
                        >
                          <FaDownload />
                          فتح الملف / تحميل
                        </a>
                      </>
                    ) : (
                      <span className="download-btn">
                        لا يوجد PDF
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedPdf && (
        <PdfViewer
          pdf={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      )}

      <Footer />
    </>
  )
}

export default Lessons