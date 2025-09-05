export const MONTHS = [
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

export const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i - 2
  return { value: year.toString(), label: year.toString() }
})

export const FILE_UPLOAD = {
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  UPLOAD_DIR: './public/uploads'
}

export const STATUS_CONFIG = {
  pending: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Disetujui', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Ditolak', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
}
