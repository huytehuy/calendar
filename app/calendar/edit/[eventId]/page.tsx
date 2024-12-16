'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Container,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
  Box,
  Tooltip
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventIcon from '@mui/icons-material/Event'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  location?: string
  start: { 
    dateTime?: string
    date?: string 
  }
  end: { 
    dateTime?: string
    date?: string 
  }
}

export default function EditEventPage({ params }: { params: { eventId: string } }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchEvent = async () => {
      if (status === 'loading') return
      if (!session?.user?.accessToken) return
      
      try {
        const response = await fetch(`/api/calendar/events/${params.eventId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch event')
        }

        const data = await response.json()
        setTitle(data.summary || '')
        setDescription(data.description || '')
        setLocation(data.location || '')
        if (data.start?.dateTime) {
          setStartDate(new Date(data.start.dateTime))
        }
        if (data.end?.dateTime) {
          setEndDate(new Date(data.end.dateTime))
        }
      } catch (error) {
        setError('Không thể tải thông tin sự kiện')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.eventId, session, status])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <Box className="fixed inset-0 flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!startDate || !endDate) {
      setError('Vui lòng chọn thời gian')
      setLoading(false)
      return
    }

    try {
      const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
      const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)

      const response = await fetch(`/api/calendar/events/${params.eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title,
          description,
          location,
          start: {
            dateTime: formattedStartDate.toISOString(),
            timeZone: 'Asia/Ho_Chi_Minh',
          },
          end: {
            dateTime: formattedEndDate.toISOString(),
            timeZone: 'Asia/Ho_Chi_Minh',
          },
        }),
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      console.error('Lỗi cập nhật:', err)
      setError('Không thể cập nhật sự kiện')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" className="my-8">
      <Stack spacing={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/')}
          >
            Quay lại
          </Button>
          <Tooltip title="Cần giúp đỡ?">
            <HelpOutlineIcon color="action" />
          </Tooltip>
        </Box>

        <Paper elevation={0} className="p-8">
          <Stack spacing={4}>
            <Typography variant="h4" align="center" gutterBottom>
              Chỉnh sửa sự kiện
            </Typography>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextField
                label="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <EventIcon color="action" className="mr-2" />
                  ),
                }}
              />

              <TextField
                label="Địa điểm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <LocationOnIcon color="action" className="mr-2" />
                  ),
                }}
              />

              <TextField
                label="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePicker
                  label="Thời gian bắt đầu"
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      const date = new Date(newValue)
                      setStartDate(date)
                      const newEnd = new Date(date)
                      newEnd.setHours(date.getHours() + 1)
                      setEndDate(newEnd)
                    }
                  }}
                  className="w-full"
                  slotProps={{
                    textField: {
                      helperText: "Chọn thời gian bắt đầu sự kiện",
                      required: true
                    }
                  }}
                  timezone="Asia/Ho_Chi_Minh"
                />

                <DateTimePicker
                  label="Thời gian kết thúc"
                  value={endDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setEndDate(new Date(newValue))
                    }
                  }}
                  className="w-full"
                  slotProps={{
                    textField: {
                      helperText: "Chọn thời gian kết thúc sự kiện",
                      required: true
                    }
                  }}
                  minDateTime={startDate || new Date()}
                  timezone="Asia/Ho_Chi_Minh"
                />
              </Box>

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading || !title || !startDate || !endDate}
                fullWidth
                className="mt-4 py-3"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
} 