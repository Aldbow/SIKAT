'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  full_name: string
  nip: string
  role: string
}

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <header className="flex justify-between items-center mb-6">
      <div>
        <p className="text-lg font-medium">{user.full_name}</p>
        <p className="text-sm text-gray-600">NIP: {user.nip}</p>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Keluar
      </Button>
    </header>
  )
}
