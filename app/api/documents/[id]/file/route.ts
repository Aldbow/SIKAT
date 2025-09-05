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

    // Get document file path from database
    const documents = await executeQuery(`
      SELECT file_path, file_name, mime_type
      FROM documents 
      WHERE id = ?
    `, [documentId])

    if (!documents || (documents as any[]).length === 0) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      )
    }

    const document = (documents as any[])[0]
    const filePath = path.join(process.cwd(), 'public', document.file_path)

    try {
      const fileBuffer = await readFile(filePath)
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': document.mime_type,
          'Content-Disposition': `inline; filename="${document.file_name}"`,
        },
      })
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { message: 'File not found on server' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Get document file error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
