import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { metadata } from "./metadata";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'

const inter = Inter({ subsets: ["latin"] });

export { metadata }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
