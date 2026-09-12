const API_ORIGIN = 'https://bm-sciences-api.soheybdz13.workers.dev'

const ALLOWED_LEVELS = [
  'first',
  'second',
  'third',
  'fourth',
]

const ALLOWED_SECTIONS = [
  'pdf',
  'word',
  'print',
  'videos',
  'ppt',
  'tests',
  'exams',
  'bem',
  'exercises',
  'summaries',
  'draw',
  'charts',
  'program',
  'guide',
  'support',
  'teacher_documents',
  'annual_progression',
  'monthly_distribution',
]

const ALLOWED_TERMS = ['term1', 'term2', 'term3']

const LESSON_FIELDS = [
  'title',
  'description',
  'image',
  'pdf',
  'word',
  'video',
  'level',
  'subject',
  'section',
  'year',
  'youtube',
  'category',
  'term',
  'ppt',
  'archive',
  'sender_email',
  'user_id',
  'status',
  'reviewed_at',
  'reviewed_by',
]

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':
      'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  })
}

function error(message, status = 400) {
  return json({ error: message }, status)
}

function cleanText(value, maxLength = 5000) {
  if (value === null || value === undefined) {
    return null
  }

  const text = String(value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength)

  return text || null
}

function cleanNullableText(value, maxLength = 5000) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return cleanText(value, maxLength)
}

function cleanFilePath(value) {
  const filePath = cleanNullableText(value, 3000)

  if (!filePath) {
    return ''
  }

  return filePath
}

function cleanLesson(lesson) {
  return lesson || null
}

function isValidLevel(value) {
  return ALLOWED_LEVELS.includes(value)
}

function isValidSection(value) {
  return ALLOWED_SECTIONS.includes(value)
}

function isValidTerm(value) {
  return value === null || value === '' || ALLOWED_TERMS.includes(value)
}

function isTopic(section) {
  return section === 'tests' || section === 'exams'
}

function getArabicTopicNumber(title = '') {
  const match = String(title).match(/رقم\s*([0-9٠-٩]+)/)

  if (!match) {
    return 0
  }

  const westernDigits = match[1].replace(
    /[٠-٩]/g,
    digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)
  )

  return Number(westernDigits) || 0
}

async function verifyAdmin(request, env) {
  const authorization = request.headers.get('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_ANON_KEY ||
    !env.ADMIN_EMAIL
  ) {
    console.error('Admin secrets are missing.')
    return null
  }

  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: authorization,
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const user = await response.json()

    if (
      !user?.email ||
      user.email.toLowerCase() !==
        env.ADMIN_EMAIL.toLowerCase()
    ) {
      return null
    }

    return user
  } catch (err) {
    console.error('ADMIN AUTH ERROR:', err)
    return null
  }
}

async function getJsonBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function normalizeLessonInput(input, isUpdate = false) {
  const data = {}

  for (const field of LESSON_FIELDS) {
    if (!isUpdate || Object.prototype.hasOwnProperty.call(input, field)) {
      data[field] = input[field]
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'title')) {
    data.title = cleanText(data.title, 500)

    if (!data.title) {
      return { error: 'عنوان الدرس مطلوب.' }
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'level')) {
    data.level = cleanText(data.level, 30)

    if (!isValidLevel(data.level)) {
      return { error: 'المستوى غير صالح.' }
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'section')) {
    data.section = cleanText(data.section, 50)

    if (!isValidSection(data.section)) {
      return { error: 'القسم غير صالح.' }
    }
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(data, 'term')) {
    data.term = cleanNullableText(data.term, 20)

    if (!isValidTerm(data.term)) {
      return { error: 'الفصل غير صالح.' }
    }
  }

  if (
    data.section &&
    isTopic(data.section) &&
    !data.term
  ) {
    return {
      error: 'الفصل مطلوب للفروض والاختبارات.',
    }
  }

  const normalTextFields = [
    'description',
    'subject',
    'year',
    'youtube',
    'category',
    'sender_email',
    'user_id',
    'status',
    'reviewed_at',
    'reviewed_by',
  ]

  for (const field of normalTextFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = cleanNullableText(data[field])
    }
  }

  const fileFields = [
    'image',
    'pdf',
    'word',
    'video',
    'ppt',
    'archive',
  ]

  for (const field of fileFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = cleanFilePath(data[field])
    }
  }

  return { data }
}

async function getLessonsByLevel(url, env) {
  const levelMatch = url.pathname.match(
    /^\/api\/levels\/([^/]+)\/lessons$/
  )

  if (!levelMatch) {
    return null
  }

  const level = decodeURIComponent(levelMatch[1])
  const section = url.searchParams.get('section')
  const term = url.searchParams.get('term')

  let sql = `
    SELECT *
    FROM lessons
    WHERE level = ?
  `

  const values = [level]

  if (section) {
    sql += ' AND section = ?'
    values.push(section)
  }

  if (term) {
    sql += ' AND term = ?'
    values.push(term)
  }

  sql += ' ORDER BY created_at DESC, id DESC'

  const lessons = await env.DB.prepare(sql)
    .bind(...values)
    .all()

  return json(lessons.results || [])
}

async function listAdminLessons(env) {
  const lessons = await env.DB.prepare(`
    SELECT *
    FROM lessons
    ORDER BY id DESC
  `).all()

  return json(lessons.results || [])
}

async function createAdminLesson(request, env, admin) {
  const body = await getJsonBody(request)

  if (!body || typeof body !== 'object') {
    return error('بيانات الطلب غير صالحة.')
  }

  const normalized = normalizeLessonInput(body)

  if (normalized.error) {
    return error(normalized.error)
  }

  const lesson = normalized.data
  const now = new Date().toISOString()

  const result = await env.DB.prepare(`
    INSERT INTO lessons (
      created_at,
      title,
const ALLOWED_LEVELS = [
  'first',
  'second',
  'third',
  'fourth',
]

const ALLOWED_SECTIONS = [
  'pdf',
  'word',
  'print',
  'videos',
  'ppt',
  'tests',
  'exams',
  'bem',
  'exercises',
  'summaries',
  'draw',
  'charts',
  'program',
  'guide',
  'support',
  'teacher_documents',
  'annual_progression',
  'monthly_distribution',
]

const ALLOWED_TERMS = ['term1', 'term2', 'term3']

const LESSON_FIELDS = [
  'title',
  'description',
  'image',
  'pdf',
  'word',
  'video',
  'level',
  'subject',
  'section',
  'year',
  'youtube',
  'category',
  'term',
  'ppt',
  'archive',
  'sender_email',
  'user_id',
  'status',
  'reviewed_at',
  'reviewed_by',
]

const USER_UPLOAD_FIELDS = [
  'status',
  'reject_reason',
  'reviewed_at',
  'reviewed_by',
]

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':
      'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  })
}

function error(message, status = 400) {
  return json({ error: message }, status)
}

function cleanText(value, maxLength = 5000) {
  if (value === null || value === undefined) {
    return null
  }

  const text = String(value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength)

  return text || null
}

function cleanNullableText(value, maxLength = 5000) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return cleanText(value, maxLength)
}

function cleanFilePath(value) {
  const filePath = cleanNullableText(value, 3000)

  if (!filePath) {
    return ''
  }

  return filePath
}

function cleanLesson(lesson) {
  return lesson || null
}

function isValidLevel(value) {
  return ALLOWED_LEVELS.includes(value)
}

function isValidSection(value) {
  return ALLOWED_SECTIONS.includes(value)
}

function isValidTerm(value) {
  return value === null || value === '' || ALLOWED_TERMS.includes(value)
}

function isTopic(section) {
  return section === 'tests' || section === 'exams'
}

function getArabicTopicNumber(title = '') {
  const match = String(title).match(/رقم\s*([0-9٠-٩]+)/)

  if (!match) {
    return 0
  }

  const westernDigits = match[1].replace(
    /[٠-٩]/g,
    digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)
  )

  return Number(westernDigits) || 0
}

async function getSupabaseUser(request, env) {
  const authorization = request.headers.get('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return {
      user: null,
      authStatus: null,
      authError: 'Missing Bearer token.',
    }
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return {
      user: null,
      authStatus: null,
      authError:
        'SUPABASE_URL or SUPABASE_ANON_KEY is missing.',
    }
  }

  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: authorization,
        },
      }
    )

    let body = null

    try {
      body = await response.json()
    } catch {
      body = null
    }

    if (!response.ok) {
      return {
        user: null,
        authStatus: response.status,
        authError:
          body?.message ||
          body?.error_description ||
          body?.error ||
          'Supabase rejected the token.',
      }
    }

    return {
      user: body,
      authStatus: response.status,
      authError: null,
    }
  } catch (err) {
    console.error('SUPABASE AUTH ERROR:', err)

    return {
      user: null,
      authStatus: null,
      authError:
        err?.message || 'Could not contact Supabase Auth.',
    }
  }
}

async function verifyAdmin(request, env) {
  if (!env.ADMIN_EMAIL) {
    console.error('ADMIN_EMAIL is missing.')
    return null
  }

  const { user } = await getSupabaseUser(request, env)

  if (!user?.email) {
    return null
  }

  const tokenEmail = user.email.trim().toLowerCase()
  const adminEmail = env.ADMIN_EMAIL.trim().toLowerCase()

  if (tokenEmail !== adminEmail) {
    console.error('Admin email does not match token email.')
    return null
  }

  return user
}

function supabaseRestHeaders(env, extraHeaders = {}) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.')
  }

  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    ...extraHeaders,
  }
}

async function supabaseRestRequest(env, path, options = {}) {
  if (!env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is missing.')
  }

  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/${path}`,
    {
      ...options,
      headers: supabaseRestHeaders(env, options.headers),
    }
  )

  let body = null

  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const message =
      body?.message ||
      body?.hint ||
      body?.error ||
      `Supabase REST request failed: ${response.status}`

    throw new Error(message)
  }

  return body
}

async function getJsonBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function normalizeLessonInput(input, isUpdate = false) {
  const data = {}

  for (const field of LESSON_FIELDS) {
    if (
      !isUpdate ||
      Object.prototype.hasOwnProperty.call(input, field)
    ) {
      data[field] = input[field]
    }
  }

  if (
    !isUpdate ||
    Object.prototype.hasOwnProperty.call(data, 'title')
  ) {
    data.title = cleanText(data.title, 500)

    if (!data.title) {
      return { error: 'عنوان الدرس مطلوب.' }
    }
  }

  if (
    !isUpdate ||
    Object.prototype.hasOwnProperty.call(data, 'level')
  ) {
    data.level = cleanText(data.level, 30)

    if (!isValidLevel(data.level)) {
      return { error: 'المستوى غير صالح.' }
    }
  }

  if (
    !isUpdate ||
    Object.prototype.hasOwnProperty.call(data, 'section')
  ) {
    data.section = cleanText(data.section, 50)

    if (!isValidSection(data.section)) {
      return { error: 'القسم غير صالح.' }
    }
  }

  if (
    !isUpdate ||
    Object.prototype.hasOwnProperty.call(data, 'term')
  ) {
    data.term = cleanNullableText(data.term, 20)

    if (!isValidTerm(data.term)) {
      return { error: 'الفصل غير صالح.' }
    }
  }

  if (
    data.section &&
    isTopic(data.section) &&
    !data.term
  ) {
    return {
      error: 'الفصل مطلوب للفروض والاختبارات.',
    }
  }

  const normalTextFields = [
    'description',
    'subject',
    'year',
    'youtube',
    'category',
    'sender_email',
    'user_id',
    'status',
    'reviewed_at',
    'reviewed_by',
  ]

  for (const field of normalTextFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = cleanNullableText(data[field])
    }
  }

  const fileFields = [
    'image',
    'pdf',
    'word',
    'video',
    'ppt',
    'archive',
  ]

  for (const field of fileFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      data[field] = cleanFilePath(data[field])
    }
  }

  return { data }
}

function normalizeUserUploadUpdate(input, adminEmail) {
  const data = {}

  for (const field of USER_UPLOAD_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      data[field] = input[field]
    }
  }

  const status = cleanText(data.status, 30)

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return {
      error:
        'الحالة يجب أن تكون pending أو approved أو rejected.',
    }
  }

  data.status = status
  data.reject_reason = cleanNullableText(
    data.reject_reason,
    3000
  )
  data.reviewed_at = new Date().toISOString()
  data.reviewed_by = adminEmail

  return { data }
}

async function getLessonsByLevel(url, env) {
  const levelMatch = url.pathname.match(
    /^\/api\/levels\/([^/]+)\/lessons$/
  )

  if (!levelMatch) {
    return null
  }

  const level = decodeURIComponent(levelMatch[1])
  const section = url.searchParams.get('section')
  const term = url.searchParams.get('term')

  let sql = `
    SELECT *
    FROM lessons
    WHERE level = ?
  `

  const values = [level]

  if (section) {
    sql += ' AND section = ?'
    values.push(section)
  }

  if (term) {
    sql += ' AND term = ?'
    values.push(term)
  }

  sql += ' ORDER BY created_at DESC, id DESC'

  const lessons = await env.DB.prepare(sql)
    .bind(...values)
    .all()

  return json(lessons.results || [])
}

async function listAdminLessons(env) {
  const lessons = await env.DB.prepare(`
    SELECT *
    FROM lessons
    ORDER BY id DESC
  `).all()

  return json(lessons.results || [])
}

async function createAdminLesson(request, env, admin) {
  const body = await getJsonBody(request)

  if (!body || typeof body !== 'object') {
    return error('بيانات الطلب غير صالحة.')
  }

  const normalized = normalizeLessonInput(body)

  if (normalized.error) {
    return error(normalized.error)
  }

  const lesson = normalized.data
  const now = new Date().toISOString()

  const result = await env.DB.prepare(`
    INSERT INTO lessons (
      created_at,
      title,
      description,
      image,
      pdf,
      word,
      video,
      level,
      subject,
      section,
      year,
      youtube,
      category,
      term,
      ppt,
      archive,
      sender_email,
      user_id,
      status,
      reviewed_at,
      reviewed_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      now,
      lesson.title,
      lesson.description,
      lesson.image,
      lesson.pdf,
      lesson.word,
      lesson.video,
      lesson.level,
      lesson.subject,
      lesson.section,
      lesson.year,
      lesson.youtube,
      lesson.category,
      lesson.term,
      lesson.ppt,
      lesson.archive,
      lesson.sender_email,
      lesson.user_id,
      lesson.status || 'approved',
      lesson.reviewed_at || now,
      lesson.reviewed_by || admin.email
    )
    .run()

  const createdLesson = await env.DB.prepare(`
    SELECT *
    FROM lessons
    WHERE id = ?
  `)
    .bind(result.meta.last_row_id)
    .first()

  return json(createdLesson, 201)
}

async function updateAdminLesson(request, env, id, admin) {
  const body = await getJsonBody(request)

  if (!body || typeof body !== 'object') {
    return error('بيانات الطلب غير صالحة.')
  }

  const existing = await env.DB.prepare(`
    SELECT *
    FROM lessons
    WHERE id = ?
  `)
    .bind(id)
    .first()

  if (!existing) {
    return error('الدرس غير موجود.', 404)
  }

  const merged = {
    ...existing,
    ...body,
  }

  const normalized = normalizeLessonInput(merged)

  if (normalized.error) {
    return error(normalized.error)
  }

  const lesson = normalized.data
  const reviewedAt = new Date().toISOString()

  await env.DB.prepare(`
    UPDATE lessons
    SET
      title = ?,
      description = ?,
      image = ?,
      pdf = ?,
      word = ?,
      video = ?,
      level = ?,
      subject = ?,
      section = ?,
      year = ?,
      youtube = ?,
      category = ?,
      term = ?,
      ppt = ?,
      archive = ?,
      sender_email = ?,
      user_id = ?,
      status = ?,
      reviewed_at = ?,
      reviewed_by = ?
    WHERE id = ?
  `)
    .bind(
      lesson.title,
      lesson.description,
      lesson.image,
      lesson.pdf,
      lesson.word,
      lesson.video,
      lesson.level,
      lesson.subject,
      lesson.section,
      lesson.year,
      lesson.youtube,
      lesson.category,
      lesson.term,
      lesson.ppt,
      lesson.archive,
      lesson.sender_email,
      lesson.user_id,
      lesson.status || existing.status || 'approved',
      reviewedAt,
      admin.email,
      id
    )
    .run()

  const updatedLesson = await env.DB.prepare(`
    SELECT *
    FROM lessons
    WHERE id = ?
  `)
    .bind(id)
    .first()

  return json(updatedLesson)
}

async function renumberTopics(env, level, section, term) {
  if (!isTopic(section) || !level || !term) {
    return
  }

  const result = await env.DB.prepare(`
    SELECT id, title, created_at
    FROM lessons
    WHERE level = ?
      AND section = ?
      AND term = ?
  `)
    .bind(level, section, term)
    .all()

  const topics = [...(result.results || [])].sort((a, b) => {
    const numberDifference =
      getArabicTopicNumber(a.title) -
      getArabicTopicNumber(b.title)

    if (numberDifference !== 0) {
      return numberDifference
    }

    return String(a.created_at || '').localeCompare(
      String(b.created_at || '')
    )
  })

  const levelLabels = {
    first: 'السنة الأولى متوسط',
    second: 'السنة الثانية متوسط',
    third: 'السنة الثالثة متوسط',
    fourth: 'السنة الرابعة متوسط',
  }

  const sectionLabels = {
    tests: 'فرض',
    exams: 'اختبار',
  }

  const termLabels = {
    term1: 'الفصل الأول',
    term2: 'الفصل الثاني',
    term3: 'الفصل الثالث',
  }

  const statements = topics.map((topic, index) => {
    const number = String(index + 1).padStart(2, '0')

    const title =
      `النموذج رقم ${number} - ` +
      `${sectionLabels[section]} ${termLabels[term]} ` +
      `في علوم الطبيعة والحياة - ${levelLabels[level]}`

    return env.DB.prepare(`
      UPDATE lessons
      SET title = ?
      WHERE id = ?
    `).bind(title, topic.id)
  })

  if (statements.length > 0) {
    await env.DB.batch(statements)
  }
}

async function deleteAdminLesson(env, id) {
  const lesson = await env.DB.prepare(`
    SELECT *
    FROM lessons
    WHERE id = ?
  `)
    .bind(id)
    .first()

  if (!lesson) {
    return error('الدرس غير موجود.', 404)
  }

  await env.DB.prepare(`
    DELETE FROM lessons
    WHERE id = ?
  `)
    .bind(id)
    .run()

  await renumberTopics(
    env,
    lesson.level,
    lesson.section,
    lesson.term
  )

  return json({
    success: true,
    message: 'تم حذف سجل الدرس من D1.',
  })
}

async function listAdminUserUploads(url, env) {
  const status = cleanText(
    url.searchParams.get('status') || 'pending',
    30
  )

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return error('الحالة غير صالحة.')
  }

  const params = new URLSearchParams({
    select: '*',
    status: `eq.${status}`,
    order: 'id.desc',
  })

  const uploads = await supabaseRestRequest(
    env,
    `user_uploads?${params.toString()}`
  )

  return json(uploads || [])
}

async function updateAdminUserUpload(request, env, id, admin) {
  const body = await getJsonBody(request)

  if (!body || typeof body !== 'object') {
    return error('بيانات الطلب غير صالحة.')
  }

  const normalized = normalizeUserUploadUpdate(
    body,
    admin.email
  )

  if (normalized.error) {
    return error(normalized.error)
  }

  const params = new URLSearchParams({
    id: `eq.${id}`,
  })

  const updated = await supabaseRestRequest(
    env,
    `user_uploads?${params.toString()}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(normalized.data),
    }
  )

  if (!Array.isArray(updated) || updated.length === 0) {
    return error('طلب الزائر غير موجود.', 404)
  }

  return json(updated[0])
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    try {
      if (
        request.method === 'GET' &&
        url.pathname === '/api/health'
      ) {
        return json({
          ok: true,
          service: 'bm-sciences-api',
        })
      }

      if (
        request.method === 'GET' &&
        url.pathname === '/api/lessons'
      ) {
        const lessons = await env.DB.prepare(`
          SELECT *
          FROM lessons
          ORDER BY id DESC
        `).all()

        return json(lessons.results || [])
      }

      const lessonMatch = url.pathname.match(
        /^\/api\/lessons\/(\d+)$/
      )

      if (request.method === 'GET' && lessonMatch) {
        const lesson = await env.DB.prepare(`
          SELECT *
          FROM lessons
          WHERE id = ?
        `)
          .bind(Number(lessonMatch[1]))
          .first()

        if (!lesson) {
          return error('Lesson not found', 404)
        }

        return json(cleanLesson(lesson))
      }

      const levelResponse = await getLessonsByLevel(url, env)

      if (request.method === 'GET' && levelResponse) {
        return levelResponse
      }

      if (url.pathname === '/api/admin/lessons') {
        const admin = await verifyAdmin(request, env)

        if (!admin) {
          return error('غير مصرح لك.', 401)
        }

        if (request.method === 'GET') {
          return listAdminLessons(env)
        }

        if (request.method === 'POST') {
          return createAdminLesson(request, env, admin)
        }

        return error('Method not allowed', 405)
      }

      const adminLessonMatch = url.pathname.match(
        /^\/api\/admin\/lessons\/(\d+)$/
      )

      if (adminLessonMatch) {
        const admin = await verifyAdmin(request, env)

        if (!admin) {
          return error('غير مصرح لك.', 401)
        }

        const id = Number(adminLessonMatch[1])

        if (request.method === 'PATCH') {
          return updateAdminLesson(request, env, id, admin)
        }

        if (request.method === 'DELETE') {
          return deleteAdminLesson(env, id)
        }

        return error('Method not allowed', 405)
      }

      if (url.pathname === '/api/admin/user-uploads') {
        const admin = await verifyAdmin(request, env)

        if (!admin) {
          return error('غير مصرح لك.', 401)
        }

        if (request.method === 'GET') {
          return listAdminUserUploads(url, env)
        }

        return error('Method not allowed', 405)
      }

      const adminUserUploadMatch = url.pathname.match(
        /^\/api\/admin\/user-uploads\/(\d+)$/
      )

      if (adminUserUploadMatch) {
        const admin = await verifyAdmin(request, env)

        if (!admin) {
          return error('غير مصرح لك.', 401)
        }

        const id = Number(adminUserUploadMatch[1])

        if (request.method === 'PATCH') {
          return updateAdminUserUpload(
            request,
            env,
            id,
            admin
          )
        }

        return error('Method not allowed', 405)
      }

      return error('Not found', 404)
    } catch (err) {
      console.error('API ERROR:', err)

      return error(
        'حدث خطأ داخلي في الخادم.',
        500
      )
    }
  },
}