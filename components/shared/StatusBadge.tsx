import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Disetujui', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Ditolak', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
  }
  
  const config = statusConfig[status] || statusConfig.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}
