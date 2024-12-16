import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/auth.config'

export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
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

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: params.eventId,
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
    console.error('Lỗi khi cập nhật sự kiện:', error)
    return NextResponse.json(
      { error: 'Không thể cập nhật sự kiện' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
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

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: params.eventId,
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Lỗi khi xóa sự kiện:', error)
    return NextResponse.json(
      { error: 'Lỗi khi xóa sự kiện' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  console.log('API called with event ID:', params.eventId)
  
  const session = await getServerSession(authOptions)
  console.log('Session in API:', {
    exists: !!session,
    hasUser: !!session?.user,
    hasToken: !!session?.user?.accessToken
  })

  if (!session?.user?.accessToken) {
    console.log('No access token found in API')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Initializing Google OAuth')
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ 
      access_token: session.user.accessToken 
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    console.log('Fetching event from Google Calendar')
    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId: params.eventId
    })

    console.log('Google Calendar Response:', response.data)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Google Calendar API Error:', error)
    return NextResponse.json(
      { error: 'Không thể lấy thông tin sự kiện' },
      { status: 500 }
    )
  }
} 