'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  Stepper,
  Step,
  StepLabel,
  Box,
  Tooltip
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventIcon from '@mui/icons-material/Event'
import { motion } from 'framer-motion'

const steps = [
  'Nhập thông tin sự kiện',
  'Chọn thời gian',
  'Xác nhận và tạo'
]

export const dynamic = 'force-dynamic'

export default function NewEvent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const now = new Date()
    const minutes = now.getMinutes()
    const roundedMinutes = Math.ceil(minutes / 30) * 30
    now.setMinutes(roundedMinutes)
    now.setSeconds(0)
    now.setMilliseconds(0)
    return now
  })
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const end = new Date(startDate || new Date())
    end.setHours(end.getHours() + 1)
    return end
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <Box className="fixed inset-0 flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          location,
          start: startDate?.toISOString(),
          end: endDate?.toISOString(),
        }),
      })

      if (response.ok) {
        setOpenSnackbar(true)
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      setError('Không thể tạo sự kiện')
    } finally {
      setLoading(false)
    }
  }

  const getStepContent = () => {
    if (!startDate || !endDate) return 0
    if (!title) return 1
    return 2
  }

  const currentStep = getStepContent()

  const renderHelperText = () => {
    switch(currentStep) {
      case 0:
        return "Nhập tiêu đề và mô tả cho sự kiện của bạn"
      case 1:
        return "Chọn thời gian bắt đầu và kết thúc"
      case 2:
        return "Kiểm tra thông tin và tạo sự kiện"
      default:
        return ""
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

        <Paper elevation={3} className="p-8">
          <Stack spacing={4}>
            <Typography variant="h4" align="center" gutterBottom>
              Tạo sự kiện mới
            </Typography>

            <Stepper activeStep={currentStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Typography color="text.secondary" align="center">
              {renderHelperText()}
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
                    setStartDate(newValue)
                    if (newValue) {
                      const newEnd = new Date(newValue)
                      newEnd.setHours(newEnd.getHours() + 1)
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
                  minDateTime={new Date()}
                />

                <DateTimePicker
                  label="Thời gian kết thúc"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  className="w-full"
                  slotProps={{
                    textField: {
                      helperText: "Chọn thời gian kết thúc sự kiện",
                      required: true
                    }
                  }}
                  minDateTime={startDate || new Date()}
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
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                disabled={loading || !title || !startDate || !endDate}
                fullWidth
                className="mt-4 py-3"
              >
                {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
              </Button>
            </form>
          </Stack>
        </Paper>
      </Stack>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success"
          variant="filled"
        >
          Tạo sự kiện thành công!
        </Alert>
      </Snackbar>
    </Container>
  )
} 