'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileText, Calendar, User, Clock, Eye } from 'lucide-react'
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
  reviewed_at: string
  document_type_name: string
  user_name: string
  reviewed_by_name: string
}

export default function DocumentViewPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id as string)
    }
  }, [params.id])

  const fetchDocument = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents/${id}`)
      const data = await response.json()

      if (response.ok) {
        setDocument(data.document)
      } else {
        setError(data.message || 'Dokumen tidak ditemukan')
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      setError('Terjadi kesalahan saat memuat dokumen')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Disetujui', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
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
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat dokumen...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'Dokumen tidak ditemukan'}</p>
            <Link href="/documents">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar Dokumen
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/documents">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Dokumen
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Detail Dokumen</h1>
        <p className="text-gray-600">Lihat informasi lengkap dan preview dokumen</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Dokumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{document.title}</h3>
                <div className="flex gap-2 mb-4">
                  {getStatusBadge(document.status)}
                  <Badge variant="outline">{document.document_type_name}</Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium">Diunggah oleh:</span>
                    <p className="text-gray-600">{document.user_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium">Periode:</span>
                    <p className="text-gray-600">
                      {new Date(0, document.month_period - 1).toLocaleDateString('id-ID', { month: 'long' })} {document.year_period}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium">Tanggal Upload:</span>
                    <p className="text-gray-600">{formatDate(document.created_at)}</p>
                  </div>
                </div>

                {document.reviewed_at && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="font-medium">Direview:</span>
                      <p className="text-gray-600">{formatDate(document.reviewed_at)}</p>
                      {document.reviewed_by_name && (
                        <p className="text-gray-600">oleh {document.reviewed_by_name}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium">Nama File:</span>
                  <p className="text-gray-600 break-all">{document.file_name}</p>
                </div>

                <div>
                  <span className="font-medium">Ukuran File:</span>
                  <p className="text-gray-600">{formatFileSize(document.file_size)}</p>
                </div>

                <div>
                  <span className="font-medium">Tipe File:</span>
                  <p className="text-gray-600">{document.mime_type}</p>
                </div>
              </div>

              {document.notes && (
                <div className="border-t pt-4">
                  <span className="font-medium">Catatan:</span>
                  <p className="text-gray-600 mt-1">{document.notes}</p>
                </div>
              )}

              {document.admin_notes && (
                <div className="border-t pt-4">
                  <span className="font-medium">Catatan Admin:</span>
                  <p className="text-gray-600 mt-1">{document.admin_notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <Button
                  className="w-full"
                  onClick={() => window.open(`/api/documents/${document.id}/file`, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Unduh Dokumen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview Dokumen</CardTitle>
              <CardDescription>
                Preview dokumen dalam format aslinya
              </CardDescription>
            </CardHeader>
            <CardContent>
              {document.mime_type === 'application/pdf' ? (
                <div className="w-full h-[800px] border rounded-lg overflow-hidden">
                  <iframe
                    src={`/api/documents/${document.id}/file`}
                    className="w-full h-full"
                    title={`Preview ${document.title}`}
                  />
                </div>
              ) : document.mime_type.startsWith('image/') ? (
                <div className="w-full max-h-[800px] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                  <img
                    src={`/api/documents/${document.id}/file`}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-[400px] border rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Preview tidak tersedia untuk tipe file ini
                    </p>
                    <Button
                      onClick={() => window.open(`/api/documents/${document.id}/file`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Unduh untuk Melihat
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
