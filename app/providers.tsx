import { ClientProviders } from './ClientProviders'
import { AuthProvider } from '@/components/AuthProvider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ClientProviders>
  )
} 