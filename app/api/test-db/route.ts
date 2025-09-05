import { NextResponse } from 'next/server'
import { testConnection, executeQuery } from '@/lib/db'

export async function GET() {
  try {
    // Test basic connection
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed'
      }, { status: 500 })
    }

    // Test query execution
    const users = await executeQuery('SELECT COUNT(*) as user_count FROM users')
    const documentTypes = await executeQuery('SELECT COUNT(*) as doc_type_count FROM document_types')
    const documents = await executeQuery('SELECT COUNT(*) as doc_count FROM documents')

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: (users as any[])[0],
        documentTypes: (documentTypes as any[])[0],
        documents: (documents as any[])[0]
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
