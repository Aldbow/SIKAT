import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { put } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'
    const status = searchParams.get('status')
    const documentType = searchParams.get('documentType')
    const search = searchParams.get('search')

    let whereClause = '1=1'
    const queryParams: any[] = []

    // If userId is provided, filter by user
    if (userId) {
      whereClause += ' AND d.user_id = ?'
      queryParams.push(userId)
    }

    // Filter by status if provided
    if (status) {
      whereClause += ' AND d.status = ?'
      queryParams.push(status)
    }

    // Filter by document type if provided
    if (documentType) {
      whereClause += ' AND d.document_type_id = ?'
      queryParams.push(documentType)
    }

    // Search in title if provided
    if (search) {
      whereClause += ' AND d.title LIKE ?'
      queryParams.push(`%${search}%`)
    }

    queryParams.push(parseInt(limit), parseInt(offset))

    const documents = await executeQuery(`
      SELECT 
        d.*,
        dt.name as document_type_name,
        u.full_name as user_name,
        reviewer.full_name as reviewed_by_name
      FROM documents d
      LEFT JOIN document_types dt ON d.document_type_id = dt.id
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN users reviewer ON d.reviewed_by = reviewer.id
      WHERE ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `, queryParams)

    // Get total count for pagination
    const countResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM documents d
      WHERE ${whereClause}
    `, queryParams.slice(0, -2))

    return NextResponse.json({
      documents,
      total: (countResult as any)[0].total,
      message: 'Documents retrieved successfully'
    })

  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const documentTypeId = formData.get('documentTypeId') as string
    const title = formData.get('title') as string
    const monthPeriod = formData.get('monthPeriod') as string
    const yearPeriod = formData.get('yearPeriod') as string
    const notes = formData.get('notes') as string
    const file = formData.get('file') as File

    if (!userId || !documentTypeId || !title || !monthPeriod || !yearPeriod || !file) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    const maxSize = 50 * 1024 * 1024 // 50MB (Vercel Blob limit)

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'Ukuran file terlalu besar. Maksimal 50MB' },
        { status: 400 }
      )
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Save file info to database
    const result = await executeQuery(`
      INSERT INTO documents (
        user_id, document_type_id, title, file_name, file_path, 
        file_size, mime_type, month_period, year_period, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, documentTypeId, title, file.name, blob.url,
      file.size, file.type, monthPeriod, yearPeriod, notes || null
    ])

    // Add to history
    await executeQuery(`
      INSERT INTO document_history (document_id, user_id, action, new_status, notes)
      VALUES (?, ?, 'created', 'pending', 'Dokumen berhasil diunggah')
    `, [(result as any).insertId, userId])

    return NextResponse.json({
      message: 'Dokumen berhasil diunggah',
      documentId: (result as any).insertId,
      url: blob.url
    })

  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}