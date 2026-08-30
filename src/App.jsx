import './App.css'

function MaintenancePage() {
  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background:
          'linear-gradient(135deg, #f1f8f4 0%, #ffffff 55%, #e8f5e9 100%)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '38px 28px',
          textAlign: 'center',
          boxShadow: '0 12px 35px rgba(27, 94, 32, 0.15)',
          border: '1px solid #d8eadb',
        }}
      >
        <div
          style={{
            width: '78px',
            height: '78px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '38px',
            background: '#e8f5e9',
          }}
        >
          🔧
        </div>

        <h1
          style={{
            color: '#1b5e20',
            fontSize: 'clamp(28px, 5vw, 42px)',
            margin: '0 0 18px',
          }}
        >
          مرحبًا بكم في CEM Sciences
        </h1>

        <p
          style={{
            color: '#333',
            fontSize: '18px',
            lineHeight: 2,
            margin: '0 auto 16px',
            maxWidth: '600px',
          }}
        >
          نعتذر منكم، المنصة تخضع حاليًا لصيانة تقنية مؤقتة من أجل تحسين
          جودة الخدمة وتنظيم المحتوى التعليمي.
        </p>

        <div
          style={{
            margin: '25px auto',
            padding: '18px',
            maxWidth: '530px',
            borderRadius: '14px',
            background: '#1b5e20',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 'bold',
            lineHeight: 1.8,
          }}
        >
          سيتم فتح الموقع رسميًا يوم 10 سبتمبر 2026 بإذن الله
        </div>

        <p
          style={{
            color: '#666',
            fontSize: '16px',
            lineHeight: 1.9,
            margin: 0,
          }}
        >
          شكرًا لتفهمكم وثقتكم.
          <br />
          فريق CEM Sciences
        </p>
      </section>
    </main>
  )
}

export default function App() {
  return <MaintenancePage />
}