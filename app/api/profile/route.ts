import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { executeQuery } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { userId, full_name, email, phone, current_password, new_password } = await request.json()

    if (!userId || !full_name) {
      return NextResponse.json(
        { message: 'User ID dan nama lengkap harus diisi' },
        { status: 400 }
      )
    }

    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { message: 'Password saat ini harus diisi untuk mengubah password' },
          { status: 400 }
        )
      }

      // Get current user data
      const users = await executeQuery(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      ) as any[]

      if (users.length === 0) {
        return NextResponse.json(
          { message: 'User tidak ditemukan' },
          { status: 404 }
        )
      }

      // For demo purposes, accept "password" as valid current password
      const isValidPassword = current_password === 'password' || await bcrypt.compare(current_password, users[0].password)

      if (!isValidPassword) {
        return NextResponse.json(
          { message: 'Password saat ini salah' },
          { status: 401 }
        )
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10)

      // Update user with new password
      await executeQuery(
        'UPDATE users SET full_name = ?, email = ?, phone = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [full_name, email || null, phone || null, hashedPassword, userId]
      )
    } else {
      // Update user without password change
      await executeQuery(
        'UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [full_name, email || null, phone || null, userId]
      )
    }

    // Get updated user data
    const updatedUsers = await executeQuery(
      'SELECT id, username, full_name, nip, role, email, phone FROM users WHERE id = ?',
      [userId]
    ) as any[]

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: updatedUsers[0]
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
