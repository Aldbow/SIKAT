export interface User {
  id: number
  username: string
  full_name: string
  nip: string
  role: 'admin' | 'guru' | 'staff'
  email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface DocumentType {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
}

export interface Document {
  id: number
  user_id: number
  document_type_id: number
  title: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  month_period: number
  year_period: number
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  admin_notes?: string
  reviewed_by?: number
  reviewed_at?: string
  created_at: string
  updated_at: string
  // Joined fields
  document_type_name?: string
  user_name?: string
  reviewed_by_name?: string
}

export interface DocumentHistory {
  id: number
  document_id: number
  user_id: number
  action: 'created' | 'updated' | 'approved' | 'rejected'
  old_status?: string
  new_status?: string
  notes?: string
  created_at: string
}

export interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
}
