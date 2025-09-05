'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, History, User, LogOut, Plus } from 'lucide-react'

interface User {
  id: number
  username: string
  full_name: string
  nip: string
  role: string
}

interface Document {
  id: number
  title: string
  status: string
  created_at: string
  document_type_name: string
  month_period: number
  year_period: number
}

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Fetch dashboard data
    fetchDashboardData(parsedUser.id)
  }, [router])

  const fetchDashboardData = async (userId: number) => {
    try {
      const [documentsRes, statsRes] = await Promise.all([
        fetch(`/api/documents?userId=${userId}&limit=5`),
        fetch(`/api/documents/stats?userId=${userId}`)
      ])

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json()
        setDocuments(documentsData.documents || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || { total: 0, approved: 0, pending: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }
    
    const statusText = {
      approved: 'Disetujui',
      pending: 'Menunggu',
      rejected: 'Ditolak'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">SIKAT</h3>
              <p className="text-sm text-gray-600">Sistem Informasi Kearsipan Terpusat</p>
            </div>
            <nav className="space-y-2">
              <a href="/dashboard" className="flex items-center px-4 py-2 text-gray-900 bg-gray-100 rounded-md">
                <FileText className="mr-3 h-5 w-5" />
                Dasbor
              </a>
              <a href="/upload" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <Upload className="mr-3 h-5 w-5" />
                Unggah Berkas Baru
              </a>
              <a href="/documents" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <FileText className="mr-3 h-5 w-5" />
                Lihat Dokumen
              </a>
              <a href="/history" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <History className="mr-3 h-5 w-5" />
                Riwayat Berkas
              </a>
              <a href="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <User className="mr-3 h-5 w-5" />
                Profil
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
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

          {/* Welcome Banner */}
          <Card className="mb-6 bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Selamat Datang, {user.full_name}</h2>
                  <p className="opacity-90">Kelola TPG Anda dengan mudah dan efisien</p>
                </div>
                <Upload className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Berkas Terkirim</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Terverifikasi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Menunggu</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-full">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ditolak</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Berkas Terbaru</CardTitle>
                <Button asChild>
                  <a href="/upload">
                    <Plus className="mr-2 h-4 w-4" />
                    Unggah Baru
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada berkas</h3>
                  <p className="mt-1 text-sm text-gray-500">Mulai dengan mengunggah berkas pertama Anda.</p>
                  <div className="mt-6">
                    <Button asChild>
                      <a href="/upload">
                        <Plus className="mr-2 h-4 w-4" />
                        Unggah Berkas
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-600">
                            Periode: {new Date(0, doc.month_period - 1).toLocaleString('id-ID', { month: 'long' })} {doc.year_period} • 
                            Diunggah: {new Date(doc.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(doc.status)}
                        <Button variant="outline" size="sm">
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-20 flex-col">
                  <a href="/upload">
                    <Upload className="h-6 w-6 mb-2" />
                    Unggah Berkas
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <a href="/history">
                    <History className="h-6 w-6 mb-2" />
                    Lihat Riwayat
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <a href="/profile">
                    <User className="h-6 w-6 mb-2" />
                    Update Profil
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
