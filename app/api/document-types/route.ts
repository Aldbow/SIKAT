import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const documentTypes = await executeQuery(`
      SELECT * FROM document_types 
      WHERE is_active = TRUE 
      ORDER BY name ASC
    `)

    return NextResponse.json({
      documentTypes,
      message: 'Document types retrieved successfully'
    })

  } catch (error) {
    console.error('Get document types error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
