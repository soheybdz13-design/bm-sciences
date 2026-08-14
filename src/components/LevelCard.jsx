import { Link } from 'react-router-dom'

import first from '../assets/first.png'
import second from '../assets/second.png'
import third from '../assets/third.png'
import fourth from '../assets/fourth.png'

function LevelCard({ title, path }) {
  let image = first
  let color = '#2e7d32'
  let background = '#e8f5e9'

  if (title.includes('الثانية')) {
    image = second
    color = '#1565c0'
    background = '#e3f2fd'
  }

  if (title.includes('الثالثة')) {
    image = third
    color = '#ef6c00'
    background = '#fff3e0'
  }

  if (title.includes('الرابعة')) {
    image = fourth
    color = '#8e24aa'
    background = '#f3e5f5'
  }

  return (
    <Link
      to={path}
      className="card level-card"
      style={{
        borderTop: `8px solid ${color}`,
        background,
        textDecoration: 'none',
        height: 'auto',
        minHeight: '250px',
        paddingBottom: '22px',
        overflow: 'visible',
      }}
    >
      <img
        src={image}
        alt={title}
        className="level-image"
      />

      <h2
        style={{
          color,
          minHeight: '62px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          whiteSpace: 'normal',
          overflow: 'visible',
          lineHeight: '1.5',
          margin: '14px 10px 0',
          padding: 0,
        }}
      >
        {title}
      </h2>
    </Link>
  )
}

export default LevelCard