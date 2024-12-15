'use client'

import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import theme from '@/lib/theme'
import { ReactNode } from 'react'
import { vi } from 'date-fns/locale'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  )
} 