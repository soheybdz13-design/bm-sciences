import { supabase } from './lib/supabaseClient'

const API_URL =
  'https://bm-sciences-api.soheybdz13.workers.dev'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options)

  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        `API request failed: ${response.status}`
    )
  }

  return payload
}

async function adminRequest(path, options = {}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error(
      'انتهت جلسة الإدارة. أعد تسجيل الدخول.'
    )
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    ...options.headers,
  }

  return request(path, {
    ...options,
    headers,
  })
}

export function getAllLessons() {
  return request('/api/lessons')
}

export function getLessonById(id) {
  return request(`/api/lessons/${id}`)
}

export function getLessonsByLevel(
  level,
  section = null,
  term = null
) {
  const params = new URLSearchParams()

  if (section) {
    params.set('section', section)
  }

  if (term) {
    params.set('term', term)
  }

  const query = params.toString()

  return request(
    `/api/levels/${encodeURIComponent(level)}/lessons${
      query ? `?${query}` : ''
    }`
  )
}

export function getAdminLessons() {
  return adminRequest('/api/admin/lessons')
}

export function createAdminLesson(lesson) {
  return adminRequest('/api/admin/lessons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lesson),
  })
}

export function updateAdminLesson(id, changes) {
  return adminRequest(`/api/admin/lessons/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(changes),
  })
}

export function deleteAdminLesson(id) {
  return adminRequest(`/api/admin/lessons/${id}`, {
    method: 'DELETE',
  })
}

export function getAdminUserUploads(status = 'pending') {
  const params = new URLSearchParams({
    status,
  })

  return adminRequest(
    `/api/admin/user-uploads?${params.toString()}`
  )
}

export function updateAdminUserUpload(id, changes) {
  return adminRequest(`/api/admin/user-uploads/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(changes),
  })
}