import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/auth.config'

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
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Không thể lấy danh sách sự kiện' },
      { status: 500 }
    )
  }
} 