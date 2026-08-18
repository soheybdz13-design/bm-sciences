import { Link } from 'react-router-dom'

function Footer() {
  const linkStyle = {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 'bold',
  }

  const separatorStyle = {
    color: '#ffffff',
    fontWeight: 'bold',
  }

  return (
    <footer className="footer" dir="rtl">
      <h3>CEM Sciences</h3>

      <p>
        منصة تعليمية لعلوم الطبيعة والحياة
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          margin: '15px 0',
        }}
      >
        <Link to="/privacy" style={linkStyle}>
          سياسة الخصوصية
        </Link>

        <span style={separatorStyle}>|</span>

        <Link to="/terms" style={linkStyle}>
          شروط الاستخدام
        </Link>

        <span style={separatorStyle}>|</span>

        <Link to="/disclaimer" style={linkStyle}>
          إخلاء المسؤولية
        </Link>
      </div>

      <p>© 2026 جميع الحقوق محفوظة</p>
    </footer>
  )
}

export default Footer