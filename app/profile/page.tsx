'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Save, Eye, EyeOff } from 'lucide-react'

interface User {
  id: number
  username: string
  full_name: string
  nip: string
  role: string
  email: string
  phone: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
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
    setFormData({
      full_name: parsedUser.full_name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
    setIsLoading(false)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      if (formData.new_password && formData.new_password !== formData.confirm_password) {
        setError('Password baru dan konfirmasi password tidak cocok')
        return
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          current_password: formData.current_password,
          new_password: formData.new_password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profil berhasil diperbarui!')
        // Update user data in localStorage
        const updatedUser = { ...user, ...data.user }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
      } else {
        setError(data.message || 'Gagal memperbarui profil')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4">Memuat profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
            <p className="text-gray-600">Kelola informasi akun Anda</p>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informasi Akun
              </CardTitle>
              <CardDescription>
                Informasi dasar akun Anda yang tidak dapat diubah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input value={user.username} disabled />
                </div>
                <div>
                  <Label>NIP</Label>
                  <Input value={user.nip} disabled />
                </div>
              </div>
              <div>
                <Label>Role</Label>
                <Input value={user.role === 'guru' ? 'Guru' : user.role === 'admin' ? 'Administrator' : 'Staff'} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Editable Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profil</CardTitle>
              <CardDescription>
                Perbarui informasi profil dan password Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nama Lengkap *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Ubah Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current_password">Password Saat Ini</Label>
                      <div className="relative">
                        <Input
                          id="current_password"
                          type={showPassword ? "text" : "password"}
                          value={formData.current_password}
                          onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
                          placeholder="Masukkan password saat ini untuk mengubah password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new_password">Password Baru</Label>
                      <Input
                        id="new_password"
                        type={showPassword ? "text" : "password"}
                        value={formData.new_password}
                        onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
                        placeholder="Masukkan password baru (kosongkan jika tidak ingin mengubah)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
                      <Input
                        id="confirm_password"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirm_password}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        placeholder="Ulangi password baru"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 text-red-800 bg-red-100 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 text-green-800 bg-green-100 rounded-lg">
                    {success}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Password yang Kuat</p>
                    <p>Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Jangan Bagikan Password</p>
                    <p>Jangan pernah membagikan password Anda kepada siapa pun</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Logout Setelah Selesai</p>
                    <p>Selalu logout dari sistem setelah selesai menggunakan</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
