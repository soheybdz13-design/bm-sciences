const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':
      'POST, GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-File-Name, X-Turnstile-Token, X-Upload-Title, X-Upload-Email, X-Upload-Level, X-Upload-Section, X-Upload-Term',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json; charset=UTF-8',
    },
  })
}

function safeFileName(name = 'file') {
  const cleanName = name
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[\\/]/g, '_')
    .trim()
    .slice(0, 180)

  return cleanName || 'file'
}

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

function isArchiveFile(fileName) {
  return /\.(zip|rar)$/i.test(fileName || '')
}

function allowedFile(fileName, contentType) {
  const ext = getFileExtension(fileName)

  const mimeType = contentType
    .split(';')[0]
    .trim()
    .toLowerCase()

  const allowedExtensions = [
    'pdf',
    'doc',
    'docx',
    'ppt',
    'pptx',
    'pps',
    'ppsx',
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'mp4',
    'webm',
    'mov',
    'zip',
    'rar',
  ]

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.rar',
    'application/x-rar-compressed',
    'application/octet-stream',
  ]

  return (
    allowedExtensions.includes(ext) &&
    allowedTypes.includes(mimeType)
  )
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function cleanText(value = '', maxLength = 300) {
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function readHeaderText(request, headerName, maxLength = 300) {
  const rawValue = request.headers.get(headerName) || ''

  try {
    return cleanText(decodeURIComponent(rawValue), maxLength)
  } catch {
    return cleanText(rawValue, maxLength)
  }
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function verifyTurnstile(token, secret) {
  if (!secret) {
    throw new Error('TURNSTILE_SECRET غير موجود في Secrets.')
  }

  const formData = new FormData()

  formData.append('secret', secret)
  formData.append('response', token)

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: formData,
    }
  )

  return response.json()
}

async function verifyAdmin(request, env) {
  const authorization =
    request.headers.get('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
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
      !env.ADMIN_EMAIL ||
      user.email.toLowerCase() !==
        env.ADMIN_EMAIL.toLowerCase()
    ) {
      return null
    }

    return user
  } catch (error) {
    console.error('ADMIN AUTH ERROR:', error)
    return null
  }
}

async function saveFile(request, env, url) {
  const encodedFileName = request.headers.get(
    'X-File-Name'
  )

  let fileName = ''

  try {
    fileName = encodedFileName
      ? decodeURIComponent(encodedFileName)
      : ''
  } catch {
    fileName = ''
  }

  const contentType =
    request.headers.get('Content-Type') ||
    'application/octet-stream'

  const contentLength = Number(
    request.headers.get('Content-Length') || 0
  )

  if (!fileName) {
    return {
      error: 'اسم الملف مفقود.',
      status: 400,
    }
  }

  if (
    !Number.isFinite(contentLength) ||
    contentLength < 0 ||
    contentLength > MAX_UPLOAD_BYTES
  ) {
    return {
      error:
        'حجم الملف كبير. الحد الحالي للرفع هو 100 MB.',
      status: 413,
    }
  }

  if (!allowedFile(fileName, contentType)) {
    return {
      error: 'هذا النوع من الملفات غير مسموح.',
      status: 415,
    }
  }

  const originalName = safeFileName(fileName)

  const folder =
    `uploads/${Date.now()}-${crypto.randomUUID()}`

  const key = `${folder}/${originalName}`

  const publicKey = key
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/')

  const contentDisposition = isArchiveFile(originalName)
    ? `attachment; filename*=UTF-8''${encodeURIComponent(
        originalName
      )}`
    : `inline; filename*=UTF-8''${encodeURIComponent(
        originalName
      )}`

  await env.FILES.put(key, request.body, {
    httpMetadata: {
      contentType,
      contentDisposition,
    },
  })

  return {
    key,
    url: `${url.origin}/files/${publicKey}`,
  }
}

async function saveUserUpload(env, data) {
  if (!env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL غير موجود في Secrets.')
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY غير موجود في Secrets.'
    )
  }

  const apiKey = env.SUPABASE_SERVICE_ROLE_KEY

  const headers = {
    apikey: apiKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }

  if (!apiKey.startsWith('sb_secret_')) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/user_uploads`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: data.title,
        user_email: data.userEmail,
        level: data.level,
        section: data.section,
        term: data.term || null,
        file_url: data.fileUrl,
        status: 'pending',
      }),
    }
  )

  let result = null

  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (!response.ok) {
    console.error(
      'SUPABASE USER_UPLOADS ERROR:',
      response.status,
      JSON.stringify(result)
    )

    throw new Error(
      result?.message ||
        result?.hint ||
        result?.details ||
        'فشل حفظ بيانات الملف في قاعدة البيانات.'
    )
  }

  return Array.isArray(result) ? result[0] : result
}

function buildApprovedEmail(title) {
  const safeTitle = escapeHtml(title)

  return {
    subject: 'تم قبول ملفك في CEM Sciences',
    textContent: `مرحبًا،

تمت مراجعة ملفك وقبوله بنجاح في موقع CEM Sciences.

عنوان الملف: ${title}

شكرًا لمساهمتك في إثراء المحتوى التعليمي.

فريق CEM Sciences`,
    htmlContent: `
      <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9;color:#222;max-width:650px;margin:0 auto;padding:24px">
        <h2 style="color:#1b5e20">تم قبول ملفك بنجاح ✅</h2>
        <p>مرحبًا،</p>
        <p>تمت مراجعة ملفك وقبوله وإضافته إلى موقع <strong>CEM Sciences</strong>.</p>
        <p style="background:#f2f8f2;padding:14px;border-radius:8px">
          <strong>عنوان الملف:</strong><br />
          ${safeTitle}
        </p>
        <p>شكرًا لمساهمتك في إثراء المحتوى التعليمي.</p>
        <p>فريق CEM Sciences</p>
      </div>
    `,
  }
}

function buildRejectedEmail(title, reason) {
  const safeTitle = escapeHtml(title)
  const safeReason = escapeHtml(reason)

  const reasonText = reason
    ? `\nسبب الرفض: ${reason}\n`
    : ''

  const reasonHtml = reason
    ? `
      <p style="background:#fff3f3;padding:14px;border-radius:8px">
        <strong>سبب الرفض:</strong><br />
        ${safeReason}
      </p>
    `
    : `
      <p>لم يتم إدخال سبب تفصيلي للرفض. يمكنك مراجعة الملف وتحسينه ثم رفعه من جديد.</p>
    `

  return {
    subject: 'بخصوص الملف المرسل إلى CEM Sciences',
    textContent: `مرحبًا،

تمت مراجعة الملف المرسل إلى موقع CEM Sciences، ولم يتم قبوله في الوقت الحالي.

عنوان الملف: ${title}
${reasonText}
يمكنك مراجعة الملف وتحسينه ثم إرساله مجددًا.

فريق CEM Sciences`,
    htmlContent: `
      <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9;color:#222;max-width:650px;margin:0 auto;padding:24px">
        <h2 style="color:#c62828">بخصوص الملف المرسل</h2>
        <p>مرحبًا،</p>
        <p>تمت مراجعة الملف المرسل إلى موقع <strong>CEM Sciences</strong>، ولم يتم قبوله في الوقت الحالي.</p>
        <p style="background:#f7f7f7;padding:14px;border-radius:8px">
          <strong>عنوان الملف:</strong><br />
          ${safeTitle}
        </p>
        ${reasonHtml}
        <p>يمكنك مراجعة الملف وتحسينه ثم إرساله مجددًا.</p>
        <p>فريق CEM Sciences</p>
      </div>
    `,
  }
}

async function sendNotificationEmail(request, env) {
  if (!env.BREVO_API_KEY) {
    return json(
      { error: 'BREVO_API_KEY غير موجود في Secrets.' },
      500
    )
  }

  if (!env.BREVO_SENDER_EMAIL) {
    return json(
      {
        error:
          'BREVO_SENDER_EMAIL غير موجود في Secrets.',
      },
      500
    )
  }

  const admin = await verifyAdmin(request, env)

  if (!admin) {
    return json(
      {
        error:
          'غير مصرح لك بإرسال إشعارات البريد.',
      },
      401
    )
  }

  let body

  try {
    body = await request.json()
  } catch {
    return json(
      { error: 'بيانات الطلب غير صالحة.' },
      400
    )
  }

  const type = cleanText(body?.type, 20)
  const toEmail = cleanText(body?.toEmail, 254)
    .toLowerCase()
  const title = cleanText(body?.title, 300)
  const reason = cleanText(body?.reason, 1000)

  if (
    type !== 'approved' &&
    type !== 'rejected'
  ) {
    return json(
      { error: 'نوع الإشعار غير صالح.' },
      400
    )
  }

  if (!isValidEmail(toEmail)) {
    return json(
      { error: 'البريد الإلكتروني للزائر غير صالح.' },
      400
    )
  }

  if (!title) {
    return json(
      { error: 'عنوان الملف مفقود.' },
      400
    )
  }

  const email =
    type === 'approved'
      ? buildApprovedEmail(title)
      : buildRejectedEmail(title, reason)

  const brevoResponse = await fetch(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name:
            env.BREVO_SENDER_NAME ||
            'CEM Sciences',
          email: env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: toEmail,
          },
        ],
        subject: email.subject,
        htmlContent: email.htmlContent,
        textContent: email.textContent,
      }),
    }
  )

  let brevoData = {}

  try {
    brevoData = await brevoResponse.json()
  } catch {
    brevoData = {}
  }

  if (!brevoResponse.ok) {
    console.error(
      'BREVO EMAIL ERROR:',
      brevoResponse.status,
      JSON.stringify(brevoData)
    )

    return json(
      {
        error:
          brevoData.message ||
          'فشل إرسال البريد عبر Brevo.',
      },
      502
    )
  }

  return json({
    success: true,
    message:
      type === 'approved'
        ? 'تم إرسال بريد القبول.'
        : 'تم إرسال بريد الرفض.',
    messageId: brevoData.messageId || null,
  })
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

    if (
      request.method === 'GET' &&
      url.pathname === '/health'
    ) {
      return json({
        ok: true,
        service: 'BM Sciences R2 upload',
      })
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/admin-notify-user'
    ) {
      return sendNotificationEmail(request, env)
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/upload'
    ) {
      const turnstileToken = request.headers.get(
        'X-Turnstile-Token'
      )

      if (!turnstileToken) {
        return json(
          { error: 'تحقق Turnstile مفقود.' },
          400
        )
      }

      const title = readHeaderText(
        request,
        'X-Upload-Title',
        300
      )

      const userEmail = readHeaderText(
        request,
        'X-Upload-Email',
        254
      ).toLowerCase()

      const level = readHeaderText(
        request,
        'X-Upload-Level',
        50
      )

      const section = readHeaderText(
        request,
        'X-Upload-Section',
        100
      )

      const term = readHeaderText(
        request,
        'X-Upload-Term',
        50
      )

      if (!title) {
        return json(
          { error: 'عنوان الملف مطلوب.' },
          400
        )
      }

      if (!isValidEmail(userEmail)) {
        return json(
          { error: 'البريد الإلكتروني غير صالح.' },
          400
        )
      }

      if (!level || !section) {
        return json(
          { error: 'المستوى والقسم مطلوبان.' },
          400
        )
      }

      let verification

      try {
        verification = await verifyTurnstile(
          turnstileToken,
          env.TURNSTILE_SECRET
        )
      } catch (error) {
        console.error(
          'TURNSTILE VERIFICATION ERROR:',
          error
        )

        return json(
          {
            error:
              'تعذر التحقق الأمني. أعد المحاولة بعد قليل.',
          },
          500
        )
      }

      if (!verification.success) {
        console.log(
          'TURNSTILE VERIFICATION FAILED:',
          JSON.stringify(verification)
        )

        return json(
          {
            error:
              'فشل التحقق الأمني. أعد تحميل الصفحة ثم أعد المحاولة.',
          },
          403
        )
      }

      const result = await saveFile(
        request,
        env,
        url
      )

      if (result.error) {
        return json(
          { error: result.error },
          result.status
        )
      }

      try {
        const savedUpload = await saveUserUpload(env, {
          title,
          userEmail,
          level,
          section,
          term,
          fileUrl: result.url,
        })

        return json({
          success: true,
          id: savedUpload?.id || null,
          key: result.key,
          url: result.url,
          status: savedUpload?.status || 'pending',
        })
      } catch (error) {
        console.error(
          'USER UPLOAD SAVE ERROR:',
          error
        )

        try {
          await env.FILES.delete(result.key)
        } catch (deleteError) {
          console.error(
            'ORPHAN FILE DELETE ERROR:',
            deleteError
          )
        }

        return json(
          {
            error:
              'تعذر حفظ بيانات الملف. لم يتم إرسال طلبك، أعد المحاولة.',
          },
          500
        )
      }
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/admin-upload'
    ) {
      const admin = await verifyAdmin(request, env)

      if (!admin) {
        return json(
          {
            error:
              'غير مصرح لك برفع ملفات الإدارة.',
          },
          401
        )
      }

      const result = await saveFile(
        request,
        env,
        url
      )

      if (result.error) {
        return json(
          { error: result.error },
          result.status
        )
      }

      return json({
        success: true,
        key: result.key,
        url: result.url,
      })
    }

    if (
      request.method === 'DELETE' &&
      url.pathname === '/admin-delete'
    ) {
      const admin = await verifyAdmin(request, env)

      if (!admin) {
        return json(
          {
            error:
              'غير مصرح لك بحذف ملفات الإدارة.',
          },
          401
        )
      }

      const key = url.searchParams.get('key')

      if (
        !key ||
        !key.startsWith('uploads/') ||
        key.split('/').some(
          part => part === '..' || part === '.'
        )
      ) {
        return json(
          { error: 'مسار الملف غير صالح.' },
          400
        )
      }

      await env.FILES.delete(key)

      return json({
        success: true,
        message: 'تم حذف الملف من R2.',
      })
    }

    if (
      request.method === 'GET' &&
      url.pathname.startsWith('/files/')
    ) {
      let key = ''

      try {
        key = decodeURIComponent(
          url.pathname.slice('/files/'.length)
        )
      } catch {
        return json(
          { error: 'مسار غير صالح.' },
          400
        )
      }

      if (
        !key ||
        key.split('/').some(
          part => part === '..' || part === '.'
        )
      ) {
        return json(
          { error: 'مسار غير صالح.' },
          400
        )
      }

      const object = await env.FILES.get(key)

      if (!object) {
        return json(
          { error: 'الملف غير موجود.' },
          404
        )
      }

      const headers = new Headers(corsHeaders())

      object.writeHttpMetadata(headers)
      headers.set('ETag', object.httpEtag)

      return new Response(object.body, {
        headers,
      })
    }

    return json({ error: 'Not found' }, 404)
  },
}