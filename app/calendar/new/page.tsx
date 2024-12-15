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

const steps = [
  'Nhập thông tin sự kiện',
  'Chọn thời gian',
  'Xác nhận và tạo'
]

export const dynamic = 'force-dynamic'

export default function NewEvent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return
    
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
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        }),
      })

      if (response.ok) {
        setOpenSnackbar(true)
        // Reset form
        setTitle('')
        setDescription('')
        setStartDate(new Date())
        setEndDate(new Date())
      } else {
        const data = await response.json()
        setError(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Lỗi khi tạo sự kiện:', error)
      setError('Không thể tạo sự kiện')
    } finally {
      setLoading(false)
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
                error={!!error}
                helperText="Ví dụ: Họp team, Sinh nhật,..."
              />

              <TextField
                label="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
                helperText="Thêm chi tiết về sự kiện (không bắt buộc)"
              />

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePicker
                  label="Thời gian bắt đầu"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  className="w-full"
                  slotProps={{
                    textField: {
                      helperText: "Chọn thời gian bắt đầu sự kiện"
                    }
                  }}
                />

                <DateTimePicker
                  label="Thời gian kết thúc"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  className="w-full"
                  slotProps={{
                    textField: {
                      helperText: "Chọn thời gian kết thúc sự kiện"
                    }
                  }}
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