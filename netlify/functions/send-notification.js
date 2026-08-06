// netlify/functions/send-notification.js
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { type, toEmail, title, reason } = body

    if (!toEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No recipient email' }),
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
        body: JSON.stringify({ error: 'Invalid type' }),
      }
    }

    await resend.emails.send({
      from: 'موقع bm-sciences <no-reply@bm-sciences.com>',
      to: toEmail,
      subject,
      text,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    console.error('EMAIL ERROR:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' }),
    }
  }
}