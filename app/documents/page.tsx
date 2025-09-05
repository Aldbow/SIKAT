'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Download, Search, Filter, FileText, Calendar, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: number
  title: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  month_period: number
  year_period: number
  status: 'pending' | 'approved' | 'rejected'
  notes: string
  admin_notes: string
  created_at: string
  updated_at: string
  document_type_name: string
  user_name: string
  reviewed_by_name: string
}

interface DocumentType {
  id: number
  name: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    fetchDocuments()
    fetchDocumentTypes()
  }, [currentPage, searchTerm, statusFilter, typeFilter])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter && typeFilter !== 'all') params.append('documentType', typeFilter)

      const response = await fetch(`/api/documents?${params}`)
      const data = await response.json()

      if (response.ok) {
        setDocuments(data.documents)
        setTotalDocuments(data.total)
      } else {
        console.error('Error fetching documents:', data.message)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentTypes = async () => {
    try {
      const response = await fetch('/api/document-types')
      const data = await response.json()
      if (response.ok) {
        setDocumentTypes(data.documentTypes)
      }
    } catch (error) {
      console.error('Error fetching document types:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      approved: { label: 'Disetujui', variant: 'default' as const },
      rejected: { label: 'Ditolak', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(totalDocuments / itemsPerPage)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Dokumen Terupload</h1>
        <p className="text-gray-600">Lihat dan kelola semua dokumen yang telah diunggah ke sistem</p>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan judul dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat dokumen...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-6">
            {documents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada dokumen yang ditemukan</p>
                </CardContent>
              </Card>
            ) : (
              documents.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 truncate">{document.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {getStatusBadge(document.status)}
                              <Badge variant="outline">{document.document_type_name}</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{document.user_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(0, document.month_period - 1).toLocaleDateString('id-ID', { month: 'long' })} {document.year_period}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Ukuran:</span> {formatFileSize(document.file_size)}
                              </div>
                              <div>
                                <span className="font-medium">Diunggah:</span> {formatDate(document.created_at)}
                              </div>
                            </div>
                            {document.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Catatan:</span> {document.notes}
                              </p>
                            )}
                            {document.admin_notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Catatan Admin:</span> {document.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/documents/${document.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Lihat
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => window.open(`/api/documents/${document.id}/file`, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                          Unduh
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-sm">
                Halaman {currentPage} dari {totalPages} ({totalDocuments} dokumen)
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
