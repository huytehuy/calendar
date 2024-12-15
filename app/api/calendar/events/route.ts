import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, start, end } = body

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: session.accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const event = {
      summary: title,
      description,
      start: {
        dateTime: start,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: end,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Lỗi khi tạo sự kiện:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo sự kiện' },
      { status: 500 }
    )
  }
} 