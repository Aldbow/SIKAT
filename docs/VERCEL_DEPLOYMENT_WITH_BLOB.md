# Deploy SIKAT ke Vercel dengan Vercel Blob untuk File Upload

Dokumen ini menjelaskan cara mendeploy aplikasi SIKAT ke Vercel dan mengkonfigurasi fitur upload file menggunakan Vercel Blob.

## Persiapan Sebelum Deploy

Sebelum memulai proses deploy, pastikan Anda telah:

1. Membuat akun Vercel di [vercel.com](https://vercel.com)
2. Menginstal Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Memastikan kode sudah di-commit dan di-push ke repository Git (GitHub, GitLab, atau Bitbucket)

## Konfigurasi Vercel Blob untuk File Upload

Vercel Blob adalah solusi penyimpanan file terkelola yang terintegrasi dengan lingkungan Vercel. Berikut cara mengkonfigurasinya:

### 1. Membuat Blob Store di Vercel Dashboard

1. Masuk ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih proyek Anda atau buat proyek baru
3. Pergi ke tab "Storage"
4. Klik "Create" dan pilih "Blob"
5. Beri nama Blob Store Anda (misalnya: `sikat-uploads`)
6. Catat nama store dan token yang dihasilkan

### 2. Menginstal Vercel Blob SDK

Instal package yang diperlukan untuk menggunakan Vercel Blob:

```bash
npm install @vercel/blob
```

### 3. Mengupdate API Upload Berkas

Modifikasi file API untuk menggunakan Vercel Blob. Biasanya file ini ada di `app/api/documents/upload/route.ts`:

```typescript
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const month = formData.get('month');
    const year = formData.get('year');
    const documentType = formData.get('documentType');
    const notes = formData.get('notes');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload file ke Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });

    // Simpan informasi file ke database
    // Anda perlu mengganti bagian ini dengan implementasi database Anda
    const document = {
      userId: session.user.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      blobUrl: blob.url,
      month,
      year,
      documentType,
      notes,
      status: 'pending',
      uploadedAt: new Date(),
    };

    // Simpan ke database (implementasi tergantung pada database yang digunakan)
    // await saveDocumentToDatabase(document);

    return NextResponse.json({ 
      message: 'File uploaded successfully', 
      url: blob.url,
      document 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Endpoint untuk mendapatkan daftar blob (opsional)
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix') || '';
  
  // Anda bisa mengimplementasi pagination jika diperlukan
  // const blobs = await list({ prefix });
  // return NextResponse.json(blobs);
  
  return NextResponse.json({ message: 'GET method not fully implemented' });
}
```

### 4. Mengupdate Form Upload di Frontend

Modifikasi komponen upload untuk menggunakan API baru dengan Vercel Blob. Contoh di `app/upload/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', month);
      formData.append('year', year);
      formData.append('documentType', documentType);
      formData.append('notes', notes);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('File uploaded successfully');
        router.push('/documents');
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Dokumen TPG</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="month" className="block text-sm font-medium mb-2">
              Bulan TPG *
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih bulan</option>
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Maret">Maret</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Juni">Juni</option>
              <option value="Juli">Juli</option>
              <option value="Agustus">Agustus</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Desember">Desember</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-2">
              Tahun TPG *
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih tahun</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium mb-2">
            Jenis Berkas *
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Pilih jenis berkas</option>
            <option value="SKMT">SKMT</option>
            <option value="SKBK">SKBK</option>
            <option value="SPMJ">SPMJ</option>
            <option value="Surat Pernyataan Memenuhi Administrasi">
              Surat Pernyataan Memenuhi Administrasi
            </option>
            <option value="Daftar Hadir Bulanan">Daftar Hadir Bulanan</option>
            <option value="Daftar Gaji Bulan">Daftar Gaji Bulan</option>
            <option value="Berita Acara">Berita Acara</option>
            <option value="KGB">KGB</option>
            <option value="Surat Permohonan Kelayakan Dispensasi Tunjangan">
              Surat Permohonan Kelayakan Dispensasi Tunjangan
            </option>
            <option value="Surat Permohonan Pembayaran Tunjangan Profesi">
              Surat Permohonan Pembayaran Tunjangan Profesi
            </option>
            <option value="Laporan Bulanan">Laporan Bulanan</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-2">
            Upload File *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              {file ? file.name : 'Pilih File'}
            </label>
            <p className="text-gray-500 text-sm mt-2">
              PDF, JPG, atau PNG (Maksimal 50MB)
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Tambahkan catatan jika diperlukan..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isUploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isUploading ? 'Mengupload...' : 'Unggah Berkas'}
        </button>
      </form>
    </div>
  );
}
```

## Langkah-langkah Deploy ke Vercel

### Metode 1: Menggunakan Vercel CLI

1. Masuk ke akun Vercel Anda:
   ```bash
   vercel login
   ```

2. Deploy proyek:
   ```bash
   vercel
   ```

3. Ikuti petunjuk di CLI:
   - Pilih scope (personal atau tim)
   - Konfirmasi direktori proyek
   - Pilih "Yes" untuk meng-overwrite setting jika sudah ada proyek
   - Pilih framework preset (Next.js)
   - Konfirmasi output directory (`.next`)
   - Pilih "No" untuk auto-detected overrides jika tidak perlu
   - Pilih lingkungan (Development/Production)

4. Setelah deploy selesai, Anda akan mendapatkan URL untuk preview.

### Metode 2: Menggunakan Vercel Dashboard

1. Masuk ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik "New Project"
3. Pilih repository yang berisi kode SIKAT
4. Konfigurasi project:
   - Framework Preset: `Next.js`
   - Root Directory: `/` (root)
   - Output Directory: `.next`
5. Klik "Deploy"
6. Tunggu proses build dan deploy selesai

## Konfigurasi Environment Variables

Setelah deploy, Anda perlu mengatur environment variables di Vercel Dashboard:

1. Masuk ke Vercel Dashboard
2. Pilih proyek Anda
3. Pergi ke tab "Settings"
4. Klik "Environment Variables"
5. Tambahkan variabel yang diperlukan:

### Variabel Database:
```
DB_HOST=your-production-host
DB_USER=your-production-user
DB_PASSWORD=your-production-password
DB_NAME=your-database-name
```

### Variabel Vercel Blob:
```
BLOB_READ_WRITE_TOKEN=your-blob-read-write-token
```

### Variabel Auth (jika menggunakan NextAuth):
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

## Integrasi Database di Vercel

Karena Vercel adalah platform serverless, Anda perlu menggunakan database eksternal seperti:

1. **PlanetScale** (MySQL serverless)
2. **Supabase** (PostgreSQL)
3. **MongoDB Atlas**
4. **Vercel Postgres** (jika tersedia untuk akun Anda)

Untuk menggunakan database MySQL seperti yang digunakan dalam SIKAT:

1. Deploy database Anda ke layanan cloud (misalnya, PlanetScale)
2. Dapatkan credential koneksi
3. Tambahkan credential tersebut sebagai environment variables di Vercel

## Pengaturan Domain Kustom (Opsional)

Jika Anda ingin menggunakan domain kustom:

1. Di Vercel Dashboard, pilih proyek Anda
2. Pergi ke tab "Settings" > "Domains"
3. Tambahkan domain Anda
4. Ikuti instruksi untuk mengatur DNS di registrar domain Anda

## Monitoring dan Logging

Vercel menyediakan monitoring dan logging bawaan:

1. **Logs**: Tersedia di tab "Logs" di Vercel Dashboard
2. **Analytics**: Tersedia di tab "Analytics" untuk melihat traffic dan performance
3. **Error Tracking**: Error akan muncul di tab "Errors"

## Troubleshooting

### Masalah Umum dan Solusi:

1. **Build Failures**:
   - Periksa logs build untuk error spesifik
   - Pastikan semua dependencies terinstal
   - Periksa versi Node.js di Vercel (default biasanya LTS)

2. **Environment Variables Tidak Terbaca**:
   - Pastikan nama variabel sesuai (huruf kapital dan underscore)
   - Periksa apakah variabel ditambahkan untuk environment yang benar (Production/Development)

3. **Masalah Database Connection**:
   - Pastikan credential database benar
   - Periksa apakah database mengizinkan koneksi dari IP Vercel
   - Untuk PlanetScale, pastikan connection string menggunakan format yang benar

4. **Masalah File Upload**:
   - Periksa limit ukuran file (Vercel memiliki limit untuk serverless functions)
   - Pastikan API route menghandle FormData dengan benar
   - Periksa konfigurasi Vercel Blob

## Kesimpulan

Dengan mengikuti tutorial ini, Anda seharusnya dapat:

1. Mendeploy aplikasi SIKAT ke Vercel
2. Mengkonfigurasi Vercel Blob untuk file upload
3. Mengatur environment variables yang diperlukan
4. Mengintegrasikan database eksternal
5. Mengatasi masalah umum yang mungkin terjadi

Vercel menyediakan platform yang sangat cocok untuk aplikasi Next.js dengan skalabilitas otomatis dan integrasi yang baik dengan berbagai layanan, termasuk Vercel Blob untuk penyimpanan file.