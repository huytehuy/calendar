'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { 
  Button, 
  Container, 
  Typography, 
  Stack, 
  Paper, 
  Grid, 
  Box,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  useMediaQuery,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import LogoutIcon from '@mui/icons-material/Logout'
import GoogleIcon from '@mui/icons-material/Google'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SyncIcon from '@mui/icons-material/Sync'
import EventIcon from '@mui/icons-material/Event'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import DevicesIcon from '@mui/icons-material/Devices'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
  location?: string
}

interface GroupedEvents {
  [date: string]: CalendarEvent[]
}

const groupEventsByDate = (events: CalendarEvent[]) => {
  const grouped: GroupedEvents = {}
  
  events.forEach(event => {
    const startDateTime = event.start.dateTime || event.start.date
    if (!startDateTime) return

    const date = new Date(startDateTime)
    const dateKey = date.toDateString()

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(event)
  })

  // Sắp xếp các sự kiện trong mỗi ngày theo thời gian
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      const aTime = new Date(a.start.dateTime || a.start.date || '')
      const bTime = new Date(b.start.dateTime || b.start.date || '')
      return aTime.getTime() - bTime.getTime()
    })
  })

  return grouped
}

const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Hôm nay'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Ngày mai'
  } else {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }
}

const LoadingOverlay = () => (
  <Box
    className="fixed inset-0 flex items-center justify-center z-50"
    sx={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)'
    }}
  >
    <Paper 
      elevation={0}
      className="p-8 rounded-xl"
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={3} alignItems="center">
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Đang tải...
        </Typography>
      </Stack>
    </Paper>
  </Box>
)

interface EventActionsProps {
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
}

const EventActions = ({ event, onEdit, onDelete }: EventActionsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        elevation={2}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleClose()
          onEdit()
        }}>
          <EditIcon fontSize="small" className="mr-2" />
          Chỉnh sửa
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleClose()
            setDeleteDialog(true)
          }}
          className="text-red-600"
        >
          <DeleteIcon fontSize="small" className="mr-2" />
          Xóa
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa sự kiện</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa sự kiện "{event.summary}" không?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Hủy
          </Button>
          <Button 
            color="error"
            variant="contained"
            onClick={() => {
              setDeleteDialog(false)
              onDelete()
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      if (status === 'loading') return
      if (!session?.user?.accessToken) return

      try {
        const response = await fetch('/api/calendar/sync', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const data = await response.json()
        setEvents(data.items || [])
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [session, status])

  const syncCalendar = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/calendar/sync')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.items || [])
      }
    } catch (error) {
      console.error('Lỗi khi đồng bộ:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = async (eventId: string, updatedData: Partial<CalendarEvent>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
      if (response.ok) {
        await syncCalendar()
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sự kiện:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await syncCalendar()
      }
    } catch (error) {
      console.error('Lỗi khi xóa sự kiện:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Home Page - Session Status:', status)
    console.log('Home Page - Session:', session)
  }, [session, status])

  useEffect(() => {
    if (session) {
      syncCalendar()
    }
  }, [session])

  const isPageLoading = isLoading || loading

  if (status === 'loading') {
    return <LoadingOverlay />
  }

  if (!session) {
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

        {/* Navigation */}
        <Box 
          component="nav" 
          className="fixed top-0 left-0 right-0 z-50"
          sx={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid',
            borderColor: 'rgba(0,0,0,0.1)'
          }}
        >
          <Container maxWidth="lg">
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
              className="h-16 px-4"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography 
                  variant="h5" 
                  fontWeight="bold"
                  sx={{ 
                    background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Calendar App
                </Typography>
              </Stack>

              <Button
                variant="contained"
                startIcon={<GoogleIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                onClick={() => signIn('google')}
                sx={{
                  px: { xs: 2, sm: 4 },
                  py: { xs: 0.8, sm: 1.2 },
                  borderRadius: '100px',
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 500,
                  background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #1d4ed8, #6d28d9)'
                  }
                }}
              >
                Đăng nhập
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Hero Section */}
        <Container maxWidth="lg" className="relative z-10">
          <Box className="min-h-[calc(100vh-64px)] flex items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Stack spacing={6} alignItems="center" maxWidth="800px" mx="auto">
                <Stack spacing={3}>
                  <Typography 
                    variant="h1" 
                    className="text-4xl md:text-6xl lg:text-7xl font-bold"
                    sx={{ 
                      lineHeight: 1.2,
                      background: 'linear-gradient(45deg, #1e293b, #3b82f6, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    Quản lý thời gian thông minh hơn
                  </Typography>

                  <Typography 
                    variant="h5" 
                    color="text.secondary"
                    className="text-lg md:text-xl max-w-2xl mx-auto"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Đồng bộ và qu���n lý lịch của bạn một cách hiệu quả với Google Calendar. 
                    Không bỏ lỡ bất kỳ sự kiện quan trọng nào.
                  </Typography>
                </Stack>

                <Grid container spacing={3} justifyContent="center" maxWidth="600px">
                  {[
                    { icon: '🚀', text: 'Dễ dàng sử dụng' },
                    { icon: '🔄', text: 'Đồng bộ tự động' },
                    { icon: '🔔', text: 'Thông báo thông minh' },
                    { icon: '📱', text: 'Truy cập mọi nơi' }
                  ].map((item, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Paper 
                          elevation={0}
                          className="p-4 text-center hover:shadow-lg transition-all duration-300"
                          sx={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3
                          }}
                        >
                          <Typography fontSize="2rem" mb={1}>
                            {item.icon}
                          </Typography>
                          <Typography 
                            variant="body1"
                            fontWeight="medium"
                            color="text.secondary"
                          >
                            {item.text}
                          </Typography>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GoogleIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                  onClick={() => signIn('google')}
                  sx={{
                    mt: 4,
                    px: { xs: 4, sm: 6 },
                    py: { xs: 1.5, sm: 2 },
                    borderRadius: '100px',
                    textTransform: 'none',
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                    fontWeight: 500,
                    background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #1d4ed8, #6d28d9)'
                    }
                  }}
                >
                  Bắt đầu ngay
                </Button>
              </Stack>
            </motion.div>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative elements - thêm hiệu ứng background */}
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

      {/* Header */}
      <Box 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1100
        }}
      >
        <Container maxWidth="lg">
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            className="h-16 px-4"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography 
                variant="h5" 
                fontWeight="bold"
                sx={{ 
                  background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Calendar App
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title={loading ? "Đang đồng bộ..." : "Đồng bộ lịch"}>
                <span>
                  <IconButton 
                    onClick={syncCalendar}
                    disabled={loading}
                    className={`transition-all duration-300 ${loading ? 'animate-spin' : 'hover:rotate-180'}`}
                  >
                    <SyncIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Avatar 
                src={session.user?.image || ''} 
                alt={session.user?.name || ''}
                className="border-2 border-white shadow-md"
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" className="py-4 sm:py-8 px-4 sm:px-6 relative z-10">
        <Grid container spacing={4} justifyContent="center">
          {/* Sidebar */}
          <Grid item xs={12} md={4} lg={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Stack spacing={3}>
                <Paper 
                  elevation={0}
                  className="p-6 bg-white/80 backdrop-blur-sm border border-gray-100"
                  sx={{ borderRadius: 3 }}
                >
                  <Stack spacing={3} alignItems="center">
                    <Avatar 
                      src={session.user?.image || ''} 
                      alt={session.user?.name || ''}
                      sx={{ width: 80, height: 80 }}
                      className="border-4 border-white shadow-lg"
                    />
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <Typography variant="h5" fontWeight="bold">
                        {session.user?.name}
                      </Typography>
                      <Typography color="text.secondary">
                        Quản lý lịch của bạn
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/calendar/new')}
                      fullWidth
                      sx={{
                        borderRadius: '100px',
                        py: 1.2,
                        background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                        '&:hover': {
                          background: 'linear-gradient(to right, #1d4ed8, #6d28d9)'
                        }
                      }}
                    >
                      Tạo sự kiện mới
                    </Button>
                  </Stack>
                </Paper>

                <Paper elevation={0} className="p-6">
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Thao tác nhanh
                    </Typography>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon />}
                      onClick={() => signOut({
                        callbackUrl: '/',
                        redirect: true
                      })}
                      fullWidth
                      sx={{
                        borderRadius: '100px',
                        py: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.04)'
                        }
                      }}
                    >
                      Đăng xuất
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </motion.div>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8} lg={9}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={0}
                className="p-6 bg-white/80 backdrop-blur-sm border border-gray-100"
                sx={{ borderRadius: 3 }}
              >
                <Stack spacing={4}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="medium">
                      Sự kiện sắp tới
                    </Typography>
                  </Stack>

                  {/* Loading state */}
                  {isPageLoading ? (
                    <Box className="py-16 flex flex-col items-center gap-4">
                      <CircularProgress />
                      <Typography color="text.secondary">
                        Đang tải danh sách sự kiện...
                      </Typography>
                    </Box>
                  ) : events.length > 0 ? (
                    <Stack spacing={4}>
                      {Object.entries(groupEventsByDate(events))
                        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                        .map(([date, dateEvents]) => (
                          <Stack key={date} spacing={3}>
                            <Stack 
                              direction="row" 
                              alignItems="center" 
                              spacing={2}
                              sx={{
                                '&::after': {
                                  content: '""',
                                  flex: 1,
                                  borderBottom: '1px solid',
                                  borderColor: 'divider'
                                }
                              }}
                            >
                              <Typography 
                                variant="h6" 
                                color="primary"
                                sx={{ 
                                  py: 1,
                                  px: 2,
                                  bgcolor: 'primary.50',
                                  borderRadius: 2,
                                  fontSize: '0.9rem',
                                  fontWeight: 'medium'
                                }}
                              >
                                {formatDateHeader(date)}
                              </Typography>
                            </Stack>

                            <Stack spacing={2}>
                              {dateEvents.map((event) => {
                                const startDateTime = event.start.dateTime || event.start.date
                                const endDateTime = event.end.dateTime || event.end.date
                                if (!startDateTime || !endDateTime) return null

                                const startDate = new Date(startDateTime)
                                const endDate = new Date(endDateTime)
                                
                                const formatTime = (date: Date) => {
                                  return date.toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                }

                                const timeRange = `${formatTime(startDate)} - ${formatTime(endDate)}`

                                return (
                                  <Paper 
                                    key={event.id} 
                                    elevation={0}
                                    className="group p-5 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200"
                                    sx={{
                                      '&:hover': {
                                        borderColor: 'primary.200',
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    <Stack spacing={2.5}>
                                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Stack spacing={2} flex={1}>
                                          <Typography 
                                            variant="h6" 
                                            fontWeight="medium"
                                            className="text-gray-900"
                                          >
                                            {event.summary}
                                          </Typography>
                                          
                                          <Stack spacing={1.5}>
                                            <Stack 
                                              direction="row" 
                                              spacing={1.5} 
                                              alignItems="center"
                                              className="text-gray-600"
                                            >
                                              <AccessTimeIcon 
                                                fontSize="small" 
                                                className="text-primary-500"
                                              />
                                              <Typography variant="body2">
                                                {timeRange}
                                              </Typography>
                                            </Stack>

                                            {event.location && (
                                              <Stack 
                                                direction="row" 
                                                spacing={1.5} 
                                                alignItems="center"
                                                className="text-gray-600"
                                              >
                                                <LocationOnIcon 
                                                  fontSize="small"
                                                  className="text-primary-500"
                                                />
                                                <Typography variant="body2">
                                                  {event.location}
                                                </Typography>
                                              </Stack>
                                            )}
                                          </Stack>
                                        </Stack>

                                        <EventActions
                                          event={event}
                                          onEdit={() => router.push(`/calendar/edit/${event.id}`)}
                                          onDelete={() => handleDeleteEvent(event.id)}
                                        />
                                      </Stack>

                                      {event.description && (
                                        <Box 
                                          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                          <Typography 
                                            variant="body2" 
                                            className="text-gray-600"
                                            style={{ 
                                              whiteSpace: 'pre-line',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              display: '-webkit-box',
                                              WebkitLineClamp: 3,
                                              WebkitBoxOrient: 'vertical',
                                              lineHeight: 1.6
                                            }}
                                          >
                                            {event.description}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Stack>
                                  </Paper>
                                )
                              })}
                            </Stack>
                          </Stack>
                        ))}
                    </Stack>
                  ) : (
                    <Box className="py-16 text-center">
                      <Stack spacing={2} alignItems="center">
                        <EventIcon 
                          sx={{ fontSize: 48 }} 
                          className="text-gray-300"
                        />
                        <Typography variant="h6" color="text.secondary">
                          Chưa có sự kiện nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Nhấn nút "Tạo sự kiện mới" để bắt đầu
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => router.push('/calendar/new')}
                          className="mt-2"
                        >
                          Tạo sự kiện mới
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
