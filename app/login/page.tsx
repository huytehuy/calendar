'use client'

import { useSession, signIn } from 'next-auth/react'
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box,
  Stack,
  CircularProgress
} from '@mui/material'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import GoogleIcon from '@mui/icons-material/Google'
import Image from 'next/image'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  if (status === 'loading') {
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
    <Container maxWidth="sm" className="min-h-screen flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Paper elevation={0} className="p-8">
          <Stack spacing={4} alignItems="center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={60}
              height={60}
              priority
            />

            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Đăng nhập
            </Typography>

            <Typography color="text.secondary" align="center">
              Đăng nhập để quản lý lịch của bạn một cách hiệu quả
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="py-3"
            >
              Đăng nhập với Google
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  )
} 