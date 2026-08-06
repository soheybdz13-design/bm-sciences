function PdfSection({ lessons }) {
  // نفترض أن lessons ديجا مرتّبة من LevelPage بالـ order
  return (
    <div style={{ marginTop: '20px' }}>
      {lessons.map(lesson => (
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
          }}
        >
          {/* يسار: معلومات الملف */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* أيقونة PDF */}
            <span
              style={{
                display: 'inline-block',
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                background: '#b71c1c',
                textAlign: 'center',
                lineHeight: '28px',
                fontWeight: 'bold',
              }}
            >
              PDF
            </span>

            {/* عنوان الملف */}
            <div>
              <div style={{ fontWeight: 'bold' }}>{lesson.title}</div>
              {lesson.subject && (
                <div style={{ fontSize: '13px', color: '#ccc' }}>
                  {lesson.subject}
                </div>
              )}
            </div>
          </div>

          {/* يمين: أزرار المعاينة والتحميل */}
          {lesson.pdf && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={lesson.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="lesson-btn"
              >
                👁️ معاينة
              </a>
              <a
                href={lesson.pdf}
                download
                className="lesson-btn"
              >
                ⬇ تحميل
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PdfSection