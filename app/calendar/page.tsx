'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Container, 
  Typography, 
  Paper, 
  Stack,
  CircularProgress,
  Box,
  Button
} from '@mui/material'
import { useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// Thêm export config để tắt static generation
export const dynamic = 'force-dynamic'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: { 
    dateTime?: string
    date?: string 
  }
  end: { 
    dateTime?: string
    date?: string
  }
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/calendar/sync')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.items || [])
        }
      } catch (error) {
        console.error('L��i khi lấy dữ liệu:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchEvents()
    }
  }, [session])

  const formatEventTime = (event: CalendarEvent) => {
    try {
      const startDateTime = event.start.dateTime || event.start.date
      const endDateTime = event.end.dateTime || event.end.date
      
      if (!startDateTime || !endDateTime) {
        return 'Chưa có thời gian'
      }

      const startDate = new Date(startDateTime)
      const endDate = new Date(endDateTime)

      // Nếu là sự kiện cả ngày (chỉ có date)
      if (!event.start.dateTime) {
        return new Intl.DateTimeFormat('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(startDate)
      }

      // Nếu là sự kiện có giờ cụ thể
      const formattedStart = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(startDate)

      const formattedEnd = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(endDate)

      return `${formattedStart} - ${formattedEnd}`
    } catch (error) {
      console.error('Lỗi format thời gian:', error)
      return 'Không thể hiển thị thời gian'
    }
  }

  if (!session) {
    useEffect(() => {
      router.replace('/')
    }, [router])
    
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Stack spacing={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/')}
          >
            Quay lại
          </Button>
          <Typography variant="h4">Lịch của tôi</Typography>
        </Stack>

        <Paper elevation={0} className="p-6">
          {loading ? (
            <Box className="flex justify-center p-4">
              <CircularProgress />
            </Box>
          ) : events.length > 0 ? (
            <Stack spacing={3}>
              {events.map((event) => (
                <Paper 
                  key={event.id} 
                  variant="outlined"
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <Stack spacing={2}>
                    <Typography variant="h6">
                      {event.summary}
                    </Typography>
                    {event.description && (
                      <Typography color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {formatEventTime(event)}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary" align="center">
              Chưa có sự kiện nào
            </Typography>
          )}
        </Paper>
      </Stack>
    </Container>
  )
} 