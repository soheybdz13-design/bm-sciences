function WordSection({ lessons }) {
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
            {/* أيقونة Word */}
            <span
              style={{
                display: 'inline-block',
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                background: '#0d47a1',
                textAlign: 'center',
                lineHeight: '28px',
                fontWeight: 'bold',
              }}
            >
              W
            </span>

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
          {lesson.word && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={lesson.word}
                target="_blank"
                rel="noopener noreferrer"
                className="lesson-btn"
              >
                👁️ معاينة
              </a>
              <a
                href={lesson.word}
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

export default WordSection