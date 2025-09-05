'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface User {
  id: number
  username: string
  full_name: string
  nip: string
  role: string
}

interface DocumentType {
  id: number
  name: string
  description: string
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    documentTypeId: '',
    title: '',
    monthPeriod: '',
    yearPeriod: '',
    notes: '',
    file: null as File | null
  })

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Fetch document types
    fetchDocumentTypes()
  }, [router])

  const fetchDocumentTypes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/document-types')
      if (response.ok) {
        const data = await response.json()
        setDocumentTypes(data.documentTypes || [])
      }
    } catch (error) {
      console.error('Error fetching document types:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setError('Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar. Maksimal 5MB')
        return
      }

      setFormData(prev => ({ ...prev, file }))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      if (!user || !formData.file) {
        setError('Semua field wajib diisi')
        return
      }

      const uploadFormData = new FormData()
      uploadFormData.append('userId', user.id.toString())
      uploadFormData.append('documentTypeId', formData.documentTypeId)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('monthPeriod', formData.monthPeriod)
      uploadFormData.append('yearPeriod', formData.yearPeriod)
      uploadFormData.append('notes', formData.notes)
      uploadFormData.append('file', formData.file)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Dokumen berhasil diunggah!')
        // Reset form
        setFormData({
          documentTypeId: '',
          title: '',
          monthPeriod: '',
          yearPeriod: '',
          notes: '',
          file: null
        })
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.message || 'Gagal mengunggah dokumen')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ]

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i - 2
    return { value: year.toString(), label: year.toString() }
  })

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
            <h1 className="text-2xl font-bold text-gray-900">Unggah Berkas TPG</h1>
            <p className="text-gray-600">Unggah berkas TPG Anda dengan mudah dan aman</p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Formulir Upload Berkas
                </CardTitle>
                <CardDescription>
                  Lengkapi informasi berkas yang akan diunggah
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month">Bulan TPG *</Label>
                      <Select value={formData.monthPeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, monthPeriod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bulan" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Tahun TPG *</Label>
                      <Select value={formData.yearPeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, yearPeriod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tahun" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentType">Jenis Berkas *</Label>
                    <Select value={formData.documentTypeId} onValueChange={(value) => setFormData(prev => ({ ...prev, documentTypeId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis berkas" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Berkas *</Label>
                    <Input
                      id="title"
                      placeholder="Masukkan judul berkas"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="file" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Pilih File
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PDF, JPG, atau PNG (Maksimal 5MB)
                          </span>
                        </Label>
                        <Input
                          id="file"
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          required
                        />
                      </div>
                      {formData.file && (
                        <div className="mt-4 text-sm text-gray-600">
                          File terpilih: {formData.file.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tambahkan catatan jika diperlukan..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center p-4 text-red-800 bg-red-100 rounded-lg">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center p-4 text-green-800 bg-green-100 rounded-lg">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {success}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Unggah Berkas
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Persyaratan Berkas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Format File</p>
                    <p className="text-sm text-gray-600">PDF, JPG, PNG (Maksimal 5MB)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Kualitas Gambar</p>
                    <p className="text-sm text-gray-600">Pastikan berkas dapat dibaca dengan jelas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Nama File</p>
                    <p className="text-sm text-gray-600">Gunakan nama yang deskriptif</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Alur Proses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Upload Berkas</p>
                    <p className="text-sm text-gray-600">Unggah berkas sesuai periode</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Verifikasi Otomatis</p>
                    <p className="text-sm text-gray-600">Sistem melakukan pengecekan awal</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Verifikasi Manual</p>
                    <p className="text-sm text-gray-600">Staf melakukan verifikasi detail</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Notifikasi Hasil</p>
                    <p className="text-sm text-gray-600">Anda akan menerima pemberitahuan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Butuh Bantuan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Jika mengalami kesulitan dalam proses upload, silakan hubungi:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> help@sikat.kemenag.go.id</p>
                  <p><strong>WhatsApp:</strong> 0812-3456-7890</p>
                  <p><strong>Jam Operasional:</strong> 08:00 - 16:00 WIB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
