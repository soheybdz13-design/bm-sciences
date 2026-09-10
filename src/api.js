const API_URL = 'https://bm-sciences-api.soheybdz13.workers.dev'

async function request(path) {
  const response = await fetch(`${API_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

export function getAllLessons() {
  return request('/api/lessons')
}

export function getLessonById(id) {
  return request(`/api/lessons/${id}`)
}

export function getLessonsByLevel(level, section = null, term = null) {
  const params = new URLSearchParams()

  if (section) params.set('section', section)
  if (term) params.set('term', term)

  const query = params.toString()

  return request(
    `/api/levels/${encodeURIComponent(level)}/lessons${
      query ? `?${query}` : ''
    }`
  )
}