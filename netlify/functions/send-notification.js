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

    const { type, toEmail, title = '', reason = '' } = JSON.parse(
      event.body || '{}'
    )

    if (
      !toEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail) ||
      /[\r\n]/.test(toEmail)
    ) {
      return json(400, { error: 'Invalid recipient email' })
    }

    let subject = ''
    let text = ''

    if (type === 'approved') {
      subject = 'تم قبول ملفك في موقع bm-sciences'
      text =
        `السلام عليكم،\n\n` +
        `تم قبول الملف بعنوان "${title}"، وهو الآن متوفر في الموقع.\n` +
        `شكراً لمساهمتك.\n\n` +
        `تحيات فريق bm-sciences.`
    } else if (type === 'rejected') {
      subject = 'تم رفض ملفك في موقع bm-sciences'
      text =
        `السلام عليكم،\n\n` +
        `للأسف تم رفض الملف بعنوان "${title}".` +
        (reason ? `\nسبب الرفض: ${reason}` : '') +
        `\n\nيمكنك تعديل الملف وإرساله مرة أخرى.\n\n` +
        `تحيات فريق bm-sciences.`
    } else {
      return json(400, { error: 'Invalid notification type' })
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('GMAIL TOKEN ERROR:', tokenData)
      return json(500, {
        error: 'Could not authenticate with Gmail',
      })
    }

    const email = [
      `From: ${mimeHeader('موقع bm-sciences')} <${GMAIL_SENDER}>`,
      `To: ${toEmail}`,
      `Subject: ${mimeHeader(subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(text, 'utf8').toString('base64'),
    ].join('\r\n')

    const sendResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64Url(email),
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

    return json(200, {
      ok: true,
      data,
    })
  } catch (err) {
    console.error('FUNCTION ERROR:', err)

    return json(500, {
      error: 'Function failed',
      details: err.message || String(err),
    })
  }
}