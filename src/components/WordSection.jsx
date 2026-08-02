function WordSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="card">
          {lesson.image && (
            <img
              src={lesson.image}
              alt={lesson.title}
              className="level-image"
            />
          )}

          <h2>{lesson.title}</h2>

          {lesson.description && (
            <p
              style={{
                padding: "10px 20px",
                textAlign: "center",
              }}
            >
              {lesson.description}
            </p>
          )}

          {lesson.subject && (
            <h4
              style={{
                color: "#1b5e20",
                marginBottom: "15px",
              }}
            >
              {lesson.subject}
            </h4>
          )}

          {lesson.word && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "100%",
                padding: "15px",
              }}
            >
              <a
                href={lesson.word}
                target="_blank"
                rel="noopener noreferrer"
                className="lesson-btn"
              >
                👁️ معاينة Word
              </a>

              <a
                href={lesson.word}
                download
                className="lesson-btn"
              >
                ⬇ تحميل Word
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default WordSection;