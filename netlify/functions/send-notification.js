import { Resend } from 'resend'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Method not allowed',
      }),
    }
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'RESEND_API_KEY is missing',
        }),
      }
    }

    const body = JSON.parse(event.body || '{}')
    const { type, toEmail, title, reason } = body

    if (!toEmail) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'No recipient email',
        }),
      }
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
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Invalid notification type',
        }),
      }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: 'موقع bm-sciences <no-reply@bm-sciences.com>',
      to: [toEmail],
      subject,
      text,
    })

    if (error) {
      console.error('RESEND ERROR:', error)

      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Resend rejected the email',
          details: error.message || String(error),
        }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ok: true,
        data,
      }),
    }
  } catch (err) {
    console.error('FUNCTION ERROR:', err)

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Function failed',
        details: err.message || String(err),
      }),
    }
  }
}