import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/UI/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'VietShop - Mua sắm thông minh',
  description: 'Mua sắm thông minh, tiết kiệm tối đa với hàng ngàn sản phẩm chính hãng.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
