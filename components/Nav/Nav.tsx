'use client'

import { AppRoutes } from '@/lib/utils/constants/AppRoutes'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { Url } from 'next/dist/shared/lib/router/router'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AiOutlineMenu } from 'react-icons/ai'
import { FiLogOut } from 'react-icons/fi'
import { 
  RiUserSharedLine, 
  RiHome2Line as Home,
  RiPercentLine as Discount,
  RiListCheck2 as Category,
  RiCupLine as Menu,
} from 'react-icons/ri'
import { useState } from 'react'
import { IconType } from 'react-icons/lib'

interface NavProps {
  session: Session | null
}

type NavButton = {
  title: string
  icon: IconType
  authenticated: boolean
  route?: Url
  method?: () => void
}

const mainNavButtons: NavButton[] = [
  { title: 'Sign In', icon: RiUserSharedLine, authenticated: false, route: AppRoutes.Auth },
  { title: 'Sign Out', icon: FiLogOut, authenticated: true, method: signOut }
]

const dropdownNavButtons: NavButton[] = [
  { title: 'Home', icon: Home, authenticated: true, route: AppRoutes.Home },
  { title: 'Menu', icon: Menu, authenticated: true, route: AppRoutes.Menu },
  { title: 'Category', icon: Category, authenticated: true, route: AppRoutes.Category },
  { title: 'Discount', icon: Discount, authenticated: true, route: AppRoutes.Discount },
]

export default function Nav({ session }: NavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const renderMainNavButtons = () => {
    return mainNavButtons
      .filter((button) => button.authenticated === !!session)
      .map(({ title, icon: Icon, method, route }) =>
        route ? (
          <Link
            key={title}
            href={route}
            className={`flex items-center p-2 rounded-md hover:bg-gray-200 transition ${
              pathname === route ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <Icon className="inline" fontSize={20} />
            <span className="hidden md:inline ml-2">{title}</span>
          </Link>
        ) : (
          <button
            key={title}
            onClick={method}
            className="flex items-center p-2 rounded-md hover:bg-gray-200 transition"
          >
            <Icon className="inline" fontSize={20} />
            <span className="hidden md:inline ml-2">{title}</span>
          </button>
        )
      )
  }

  const renderDropdownNavButtons = () => {
    return dropdownNavButtons
      .filter((button) => button.authenticated === !!session)
      .map(({ title, icon: Icon, route }) => (
        <Link
          key={title}
          href={route!}
          className="flex items-center p-2 rounded-md hover:bg-gray-200 transition"
          // Klik pada link juga akan menutup dropdown
          onClick={() => setIsOpen(false)}
        >
          <Icon className="inline" fontSize={20} />
          <span className="ml-2">{title}</span>
        </Link>
      ))
  }

  return (
    <nav className="relative flex z-50 items-center gap-4">
      <div className="flex gap-2">{renderMainNavButtons()}</div>

      {session && (
        <div className="relative">
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <AiOutlineMenu fontSize={24} />
          </button>

          {isOpen && (
            <>
              {/* Overlay yang menutupi seluruh layar, 
                  klik di overlay akan menutup dropdown */}
              <div
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40"
              />
              {/* Dropdown */}
              <div
                className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 flex flex-col gap-2 z-50"
                // Jika dropdown diklik (misal, area kosong di dalamnya), langsung tertutup
                onClick={() => setIsOpen(false)}
              >
                {renderDropdownNavButtons()}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
