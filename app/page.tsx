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
  useMediaQuery
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
import Image from 'next/image'

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

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    if (session !== undefined) {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session) {
      syncCalendar()
    }
  }, [session])

  if (isLoading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return (
      <Box className="min-h-screen">
        {/* Navigation */}
        <Box 
          component="nav" 
          className="fixed top-0 left-0 right-0 z-50"
          sx={{ 
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            boxShadow: 1
          }}
        >
          <Container maxWidth="lg">
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
              className="py-3"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthIcon color="primary" fontSize="large" />
                <Typography variant="h5" component="h1" fontWeight="bold">
                  Calendar App
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={() => signIn('google', { prompt: 'select_account' })}
                size={isMobile ? "small" : "medium"}
              >
                Đăng nhập
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box className="pt-20">
          <Container maxWidth="lg" className="py-8">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack spacing={4}>
                  <Typography 
                    variant={isMobile ? "h3" : "h2"} 
                    component="h2" 
                    fontWeight="bold"
                    className="leading-tight"
                  >
                    Quản Lý Lịch Làm Việc
                    <Typography 
                      component="span" 
                      color="primary.main" 
                      variant={isMobile ? "h3" : "h2"} 
                      fontWeight="bold"
                    >
                      {" "}Thông Minh & Hiệu Quả
                    </Typography>
                  </Typography>
                  
                  <Typography variant="h6" color="text.secondary">
                    Giải pháp quản lý thời gian toàn diện, giúp bạn tối ưu hóa lịch làm việc
                  </Typography>

                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={2}
                    className="w-full"
                  >
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => signIn('google', { prompt: 'select_account' })}
                      startIcon={<GoogleIcon />}
                      fullWidth={isMobile}
                      className="py-3"
                    >
                      Bắt đầu miễn phí
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      href="#features"
                      fullWidth={isMobile}
                      className="py-3"
                    >
                      Tìm hiểu thêm
                    </Button>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className="relative" style={{ height: isMobile ? '300px' : '400px' }}>
                  <Image
                    src="/calendar-illustration.svg"
                    alt="Calendar Illustration"
                    fill
                    className="object-contain"
                    priority
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box id="features" className="py-16 bg-gray-50">
          <Container maxWidth="lg">
            <Stack spacing={8}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Typography variant="h3" component="h2" fontWeight="bold">
                  Tính năng nổi bật
                </Typography>
                <Typography variant="h6" color="text.secondary" className="max-w-2xl">
                  Trải nghiệm những tính năng hiện đại giúp việc quản lý thời gian trở nên dễ dàng hơn bao giờ hết
                </Typography>
              </Stack>

              <Grid container spacing={4}>
                {[
                  {
                    icon: <CalendarMonthIcon fontSize="large" color="primary" />,
                    title: "Lịch thông minh",
                    description: "Tự động đồng bộ với Google Calendar, cập nhật realtime mọi thay đổi"
                  },
                  {
                    icon: <NotificationsActiveIcon fontSize="large" color="primary" />,
                    title: "Nhắc nhở tự động",
                    description: "Không bỏ lỡ bất kỳ sự kiện quan trọng nào với hệ thống thông báo thông minh"
                  },
                  {
                    icon: <SecurityIcon fontSize="large" color="primary" />,
                    title: "Bảo mật tuyệt đối",
                    description: "Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn cao nhất"
                  },
                  {
                    icon: <AccessTimeIcon fontSize="large" color="primary" />,
                    title: "Tiết kiệm thời gian",
                    description: "Giao diện đơn giản, dễ sử dụng giúp bạn tạo và quản lý sự kiện nhanh chóng"
                  },
                  {
                    icon: <DevicesIcon fontSize="large" color="primary" />,
                    title: "Đa nền tảng",
                    description: "Sử dụng trên mọi thiết bị, đồng bộ liền mạch giữa desktop và mobile"
                  },
                  {
                    icon: <EventIcon fontSize="large" color="primary" />,
                    title: "Quản lý sự kiện",
                    description: "Dễ dàng tạo, chỉnh sửa và theo dõi các sự kiện trong lịch của bạn"
                  }
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      elevation={0} 
                      className="h-full hover:shadow-md transition-shadow duration-300"
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <CardContent>
                        <Stack spacing={2} alignItems="center" textAlign="center">
                          {feature.icon}
                          <Typography variant="h6" component="h3">
                            {feature.title}
                          </Typography>
                          <Typography color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box className="py-16 bg-primary-900" sx={{ bgcolor: 'primary.main' }}>
          <Container maxWidth="md">
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Typography variant="h3" color="white" fontWeight="bold">
                Bắt đầu ngay hôm nay
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
                Tham gia cùng hàng nghìn người dùng đang sử dụng Calendar App
              </Typography>
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                onClick={() => signIn('google', { prompt: 'select_account' })}
                startIcon={<GoogleIcon />}
                className="py-3 px-8"
              >
                Đăng nhập miễn phí
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Header */}
      <Box 
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
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
            className="py-2"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarMonthIcon color="primary" />
              <Typography variant="h6">
                Calendar App
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="Đồng bộ lịch">
                <IconButton onClick={syncCalendar} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : <SyncIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Cài đặt">
                <IconButton onClick={() => router.push('/settings')}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Avatar 
                src={session.user?.image || ''} 
                alt={session.user?.name || ''}
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" className="py-8">
        <Grid container spacing={4}>
          {/* Welcome & Actions */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper elevation={0} className="p-6">
                <Stack spacing={2}>
                  <Typography variant="h5">
                    Xin chào, {session.user?.name}
                  </Typography>
                  <Typography color="text.secondary">
                    Quản lý lịch của bạn
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/calendar/new')}
                    fullWidth
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
                    startIcon={<EventIcon />}
                    onClick={() => router.push('/calendar')}
                    fullWidth
                  >
                    Xem tất cả sự kiện
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={() => signOut({ callbackUrl: '/' })}
                    fullWidth
                  >
                    Đăng xuất
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Calendar Events */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} className="p-6">
              <Stack spacing={3}>
                <Typography variant="h6">
                  Sự kiện sắp tới
                </Typography>

                {loading ? (
                  <Box className="flex justify-center p-4">
                    <CircularProgress />
                  </Box>
                ) : events.length > 0 ? (
                  <Stack spacing={2}>
                    {events.map((event) => {
                      const startDateTime = event.start.dateTime || event.start.date
                      if (!startDateTime) return null

                      const startDate = new Date(startDateTime)
                      const formattedDate = new Intl.DateTimeFormat('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        ...(event.start.dateTime ? {
                          hour: '2-digit',
                          minute: '2-digit'
                        } : {})
                      }).format(startDate)

                      return (
                        <Paper 
                          key={event.id} 
                          variant="outlined"
                          className="p-4 hover:shadow-md transition-shadow"
                        >
                          <Stack spacing={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {event.summary}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formattedDate}
                            </Typography>
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Không có sự kiện nào sắp tới
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
