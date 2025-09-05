'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, FileText, Search, Filter, Eye } from 'lucide-react'

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
  file_name: string
  notes: string
  admin_notes: string
  reviewed_at: string
  reviewed_by_name: string
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
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

    // Fetch all documents
    fetchDocuments(parsedUser.id)
  }, [router])

  useEffect(() => {
    // Filter documents based on search and filters
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_type_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter)
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(doc => doc.year_period.toString() === yearFilter)
    }

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, statusFilter, yearFilter])

  const fetchDocuments = async (userId: number) => {
    try {
      const response = await fetch(`/api/documents?userId=${userId}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
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

  const getUniqueYears = () => {
    const years = Array.from(new Set(documents.map(doc => doc.year_period)))
    return years.sort((a, b) => b - a)
  }

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[month - 1]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4">Memuat riwayat berkas...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Berkas</h1>
            <p className="text-gray-600">Lihat semua berkas yang pernah Anda unggah</p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cari Berkas</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari judul atau jenis berkas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tahun</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {getUniqueYears().map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hasil</label>
                <p className="text-sm text-gray-600 pt-2">
                  {filteredDocuments.length} dari {documents.length} berkas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Berkas</CardTitle>
            <CardDescription>
              Semua berkas yang pernah Anda unggah ke sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {documents.length === 0 ? 'Belum ada berkas' : 'Tidak ada berkas yang sesuai filter'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {documents.length === 0 
                    ? 'Mulai dengan mengunggah berkas pertama Anda.'
                    : 'Coba ubah filter atau kata kunci pencarian.'
                  }
                </p>
                {documents.length === 0 && (
                  <div className="mt-6">
                    <Button asChild>
                      <a href="/upload">
                        Unggah Berkas Pertama
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {doc.document_type_name}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>
                              Periode: {getMonthName(doc.month_period)} {doc.year_period}
                            </span>
                            <span>•</span>
                            <span>
                              Diunggah: {new Date(doc.created_at).toLocaleDateString('id-ID')}
                            </span>
                            {doc.reviewed_at && (
                              <>
                                <span>•</span>
                                <span>
                                  Diverifikasi: {new Date(doc.reviewed_at).toLocaleDateString('id-ID')}
                                </span>
                              </>
                            )}
                          </div>
                          {doc.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Catatan:</strong> {doc.notes}
                            </p>
                          )}
                          {doc.admin_notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Catatan Admin:</strong> {doc.admin_notes}
                            </p>
                          )}
                          {doc.reviewed_by_name && (
                            <p className="text-sm text-gray-500 mt-1">
                              Diverifikasi oleh: {doc.reviewed_by_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(doc.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
