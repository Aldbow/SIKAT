import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    // Get document info from database
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
      WHERE d.id = ?
    `, [documentId])

    if (!documents || (documents as any[]).length === 0) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    const document = (documents as any[])[0]

    return NextResponse.json({
      document,
      message: 'Document retrieved successfully'
    })

  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
