'use client'

import { SessionProvider } from 'next-auth/react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { vi } from 'date-fns/locale'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'

export function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode
  session: any
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 