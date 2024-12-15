import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { metadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
