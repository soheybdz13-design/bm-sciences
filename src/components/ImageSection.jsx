function ImageSection({ lessons }) {
  return (
    <div className="sections-grid">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="card">
          <img
            src={lesson.image}
            alt={lesson.title}
            style={{
              width: "100%",
              height: "260px",
              objectFit: "contain",
              background: "#fff",
              borderRadius: "12px",
            }}
          />

          <h2
            style={{
              marginTop: "15px",
              textAlign: "center",
            }}
          >
            {lesson.title}
          </h2>

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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "15px",
            }}
          >
            <a
              href={lesson.image}
              target="_blank"
              rel="noopener noreferrer"
              className="lesson-btn"
            >
              🔍 عرض الصورة
            </a>

            <a
              href={lesson.image}
              download
              className="lesson-btn"
            >
              ⬇ تحميل الصورة
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageSection;