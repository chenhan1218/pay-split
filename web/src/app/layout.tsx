import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pay-Split',
  description: 'Split expenses with friends easily',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
              <div className="container flex h-14 items-center px-4">
                <div className="mr-4 hidden md:flex">
                  <Link className="mr-6 flex items-center space-x-2 font-bold" href="/">
                    Pay-Split
                  </Link>
                </div>
                {/* Mobile Menu Placeholder */}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <div className="w-full flex-1 md:w-auto md:flex-none">
                    {/* Search or other controls */}
                  </div>
                  <nav className="flex items-center space-x-2">
                    <ModeToggle />
                  </nav>
                </div>
              </div>
            </header>
            <main className="container flex-1 px-4 py-6 md:px-6">{children}</main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
