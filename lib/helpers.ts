export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getMonthName = (monthNumber: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[monthNumber - 1] || ''
}

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG' }
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'Ukuran file terlalu besar. Maksimal 5MB' }
  }

  return { isValid: true }
}
