'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Upload, History, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dasbor', href: '/dashboard', icon: FileText },
  { name: 'Unggah Berkas Baru', href: '/upload', icon: Upload },
  { name: 'Lihat Dokumen', href: '/documents', icon: FileText },
  { name: 'Riwayat Berkas', href: '/history', icon: History },
  { name: 'Profil', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">SIKAT</h3>
          <p className="text-sm text-gray-600">Sistem Informasi Kearsipan Terpusat</p>
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-2 rounded-md transition-colors',
                  isActive
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
