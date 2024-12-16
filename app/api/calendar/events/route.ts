import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/auth.config'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ 
      access_token: session.user.accessToken 
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: body.summary,
        description: body.description,
        location: body.location,
        start: {
          dateTime: body.start.dateTime,
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: body.end.dateTime,
          timeZone: 'Asia/Ho_Chi_Minh',
        },
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Không thể tạo sự kiện' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ 
      access_token: session.user.accessToken 
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Không thể lấy danh sách sự kiện' },
      { status: 500 }
    )
  }
} 