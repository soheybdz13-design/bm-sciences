const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

const base64Url = (value) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const mimeHeader = (value) =>
  `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`

const validEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
  !/[\r\n]/.test(email)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REFRESH_TOKEN,
      GMAIL_SENDER,
    } = process.env

    if (
      !GOOGLE_CLIENT_ID ||
      !GOOGLE_CLIENT_SECRET ||
      !GOOGLE_REFRESH_TOKEN ||
      !GMAIL_SENDER
    ) {
      return json(500, {
        error: 'Gmail configuration is missing',
      })
    }

    const body = JSON.parse(event.body || '{}')

    const {
      type,
      toEmail,
      title = '',
      reason = '',
      name = '',
      email = '',
      message = '',
    } = body

    let recipient = ''
    let subject = ''
    let text = ''
    let replyTo = ''

    if (type === 'approved') {
      if (!validEmail(toEmail)) {
        return json(400, { error: 'Invalid recipient email' })
      }

      recipient = toEmail
      subject = 'تم قبول ملفك في موقع CEM Sciences'
      text =
        `السلام عليكم،\n\n` +
        `تم قبول الملف بعنوان "${title}"، وهو الآن متوفر في الموقع.\n` +
        `شكراً لمساهمتك.\n\n` +
        `تحيات فريق CEM Sciences.`
    } else if (type === 'rejected') {
      if (!validEmail(toEmail)) {
        return json(400, { error: 'Invalid recipient email' })
      }

      recipient = toEmail
      subject = 'تم رفض ملفك في موقع CEM Sciences'
      text =
        `السلام عليكم،\n\n` +
        `للأسف تم رفض الملف بعنوان "${title}".` +
        (reason ? `\nسبب الرفض: ${reason}` : '') +
        `\n\nيمكنك تعديل الملف وإرساله مرة أخرى.\n\n` +
        `تحيات فريق CEM Sciences.`
    } else if (type === 'contact') {
      if (
        !name.trim() ||
        !message.trim() ||
        !validEmail(email) ||
        name.length > 100 ||
        message.length > 5000
      ) {
        return json(400, { error: 'Invalid contact form data' })
      }

      recipient = GMAIL_SENDER
      replyTo = email.trim()
      subject = `رسالة جديدة من موقع CEM Sciences: ${name.trim()}`
      text =
        `وصلتك رسالة جديدة من صفحة اتصل بنا.\n\n` +
        `الاسم: ${name.trim()}\n` +
        `البريد الإلكتروني: ${email.trim()}\n\n` +
        `الرسالة:\n${message.trim()}`
    } else {
      return json(400, { error: 'Invalid notification type' })
    }

    const tokenResponse = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      }
    )

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('GMAIL TOKEN ERROR:', tokenData)
      return json(500, {
        error: 'Could not authenticate with Gmail',
      })
    }

    const emailLines = [
      `From: ${mimeHeader('موقع CEM Sciences')} <${GMAIL_SENDER}>`,
      `To: ${recipient}`,
      `Subject: ${mimeHeader(subject)}`,
      ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(text, 'utf8').toString('base64'),
    ]

    const emailContent = emailLines.join('\r\n')

    const sendResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64Url(emailContent),
        }),
      }
    )

    const data = await sendResponse.json()

    if (!sendResponse.ok) {
      console.error('GMAIL SEND ERROR:', data)
      return json(500, {
        error: 'Gmail rejected the email',
      })
    }

    return json(200, { ok: true })
  } catch (err) {
    console.error('FUNCTION ERROR:', err)

    return json(500, {
      error: 'Function failed',
      details: err.message || String(err),
    })
  }
}