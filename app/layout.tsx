import Nav from '@/components/Nav/Nav'
import Providers from '@/lib/utils/Providers/Provider.client'
import { getServerSession } from 'next-auth'
import { Inter } from 'next/font/google'
import { authOptions } from './api/auth/[...nextauth]/route'
import './globals.css'
import StoreProvider from "./StoreProvider"
import ClientHeader from '@/components/Header/ClientHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nata Foodcourt',
  description: 'Nata Foodcourt Admin'
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang='en'>
      <StoreProvider>
        <body
          className={`${inter.className} bg-primary text-black min-h-screen font-medium`}
        >
          {/* HEADER */}
          <header className='flex justify-between items-center px-4 py-2'>
            <ClientHeader />
            <Nav session={session} />
          </header>

          {/* CONTENT */}
          <main className='flex h-[80vh] flex-col items-center px-4 overflow-auto'>
            <Providers>{children}</Providers>
          </main>
          {/* FOOTER */}
          <footer
            className='w-full  p-2 border-t
          absolute bottom-0'
          >
            <div className='flex flex-col text-sm items-center'>
              <span>NATA FOODCOURT</span>
            </div>
            <div className='flex flex-col text-xs scale-75 items-center'>
              <span>nata foodcourt admin</span>
            </div>
          </footer>
        </body>
      </StoreProvider>
    </html>
  )
}
