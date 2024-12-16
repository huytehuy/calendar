'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Container,
  Stack,
  Box,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import EventIcon from '@mui/icons-material/Event'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DescriptionIcon from '@mui/icons-material/Description'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useMediaQuery, useTheme } from '@mui/material'

export default function EventForm({ params }: { params: { action: string, eventId?: string } }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'))

  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking session...')
      console.log('Status:', status)
      console.log('Session:', session)

      if (status === 'loading') {
        console.log('Session is loading...')
        return
      }

      if (!session) {
        console.log('No session found')
        return
      }

      if (!session.user?.accessToken) {
        console.log('No access token found')
        return
      }

      console.log('Session is valid, proceeding...')
    }

    checkSession()
  }, [session, status])

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (status !== 'authenticated' || !session?.user?.accessToken) {
        return
      }

      if (params.action === 'edit' && params.eventId) {
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
          console.error('Error:', error)
          setError('Không thể tải thông tin sự kiện')
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [params.action, params.eventId, session, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    setLoading(true)
    setError('')

    try {
      const eventData = {
        summary: title,
        description,
        location,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
      }

      const response = await fetch(`/api/calendar/events/${params.eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      router.push('/')
    } catch (error) {
      setError('Không thể cập nhật sự kiện')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Box className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <Paper className="p-6 rounded-lg">
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={40} />
            <Typography>Đang tải...</Typography>
          </Stack>
        </Paper>
      </Box>
    )
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative elements */}
      <Box className="absolute inset-0">
        <motion.div
          className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </Box>

      <Container 
        maxWidth="md" 
        className="relative z-10 py-4 sm:py-8 px-4 sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={0}
            className="p-4 sm:p-8 bg-white/90 backdrop-blur-sm border border-gray-100"
            sx={{ 
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Stack spacing={4}>
              {/* Header */}
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={2}
                className="pb-4 border-b border-gray-100"
              >
                <Tooltip title="Quay lại">
                  <IconButton 
                    onClick={() => router.back()}
                    className="hover:bg-gray-50"
                    size={isMobile ? "small" : "medium"}
                  >
                    <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
                <Typography 
                  variant="h5" 
                  fontWeight="bold"
                  className="text-lg sm:text-xl"
                  sx={{ 
                    background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {params.action === 'edit' ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
                </Typography>
              </Stack>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  {/* Basic Info Section */}
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      className="mb-3"
                      sx={{ fontWeight: 500 }}
                    >
                      Thông tin cơ bản
                    </Typography>
                    <Stack spacing={3}>
                      <TextField
                        label="Tiêu đề sự kiện"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <EventIcon 
                              className="mr-2 text-gray-400"
                              sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                            />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 1.5, sm: 2 },
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.95)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'white',
                            }
                          },
                        }}
                      />

                      <TextField
                        label="Địa điểm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <LocationOnIcon 
                              className="mr-2 text-gray-400"
                              sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                            />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 1.5, sm: 2 },
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.95)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'white',
                            }
                          },
                        }}
                      />
                    </Stack>
                  </Box>

                  {/* Time Section */}
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      className="mb-3"
                      sx={{ fontWeight: 500 }}
                    >
                      Thời gian
                    </Typography>
                    <Stack spacing={3}>
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
                        slotProps={{
                          textField: {
                            required: true,
                            size: "small",
                            InputProps: {
                              startAdornment: (
                                <AccessTimeIcon 
                                  className="mr-2 text-gray-400"
                                  sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                                />
                              ),
                            },
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'white',
                                }
                              },
                              '& .Mui-error': {
                                color: 'inherit'
                              },
                              '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23)'
                              }
                            },
                          },
                        }}
                        timezone="Asia/Ho_Chi_Minh"
                        defaultValue={new Date()}
                      />

                      <DateTimePicker
                        label="Thời gian kết thúc"
                        value={endDate}
                        onChange={(newValue) => {
                          if (newValue) {
                            setEndDate(new Date(newValue))
                          }
                        }}
                        slotProps={{
                          textField: {
                            required: true,
                            size: "small",
                            InputProps: {
                              startAdornment: (
                                <AccessTimeIcon 
                                  className="mr-2 text-gray-400"
                                  sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                                />
                              ),
                            },
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'white',
                                }
                              },
                              '& .Mui-error': {
                                color: 'inherit'
                              },
                              '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23)'
                              }
                            },
                          },
                        }}
                        minDateTime={startDate || new Date()}
                        timezone="Asia/Ho_Chi_Minh"
                      />
                    </Stack>
                  </Box>

                  {/* Description Section */}
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      className="mb-3"
                      sx={{ fontWeight: 500 }}
                    >
                      Mô tả chi tiết
                    </Typography>
                    <TextField
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Nhập mô tả chi tiết về sự kiện..."
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <DescriptionIcon 
                            className="mr-2 mt-1 text-gray-400"
                            sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                          />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: 1.5, sm: 2 },
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.95)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'white',
                          }
                        },
                      }}
                    />
                  </Box>

                  {error && (
                    <Alert 
                      severity="error"
                      sx={{ 
                        borderRadius: { xs: 1.5, sm: 2 },
                        backgroundColor: 'rgba(255,255,255,0.8)'
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                    disabled={loading || !title || !startDate || !endDate}
                    fullWidth
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      borderRadius: '100px',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #1d4ed8, #6d28d9)',
                        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)'
                      }
                    }}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu sự kiện'}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
} 