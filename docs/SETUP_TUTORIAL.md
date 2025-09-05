# SIKAT - Setup Tutorial

Panduan lengkap untuk menjalankan aplikasi SIKAT di komputer lain.

## Prasyarat

Sebelum memulai, pastikan komputer Anda telah terinstall:

1. **Node.js** (versi 18 atau lebih baru)
   - Download dari: https://nodejs.org/
   - Verifikasi instalasi: `node --version` dan `npm --version`

2. **MySQL Server** (versi 8.0 atau lebih baru)
   - Download dari: https://dev.mysql.com/downloads/mysql/
   - Atau gunakan XAMPP/WAMP yang sudah include MySQL

3. **Git** (opsional, untuk clone repository)
   - Download dari: https://git-scm.com/

## Langkah 1: Download/Clone Project

### Opsi A: Clone dari Git Repository
```bash
git clone <repository-url>
cd Project-Manda
```

### Opsi B: Download ZIP
1. Download file ZIP project
2. Extract ke folder yang diinginkan
3. Buka terminal/command prompt di folder project

## Langkah 2: Install Dependencies

Jalankan perintah berikut di terminal:

```bash
npm install
```

Tunggu hingga semua dependencies terinstall.

## Langkah 3: Setup Database

### 3.1 Buat Database MySQL

1. Buka MySQL client atau phpMyAdmin
2. Buat database baru:
   ```sql
   CREATE DATABASE sikat_db;
   ```

### 3.2 Import Schema Database

1. Jalankan script SQL yang ada di `database/schema.sql`:
   ```bash
   mysql -u root -p sikat_db < database/schema.sql
   ```

   Atau copy-paste isi file `database/schema.sql` ke MySQL client.

### 3.3 Verifikasi Database

Pastikan tabel-tabel berikut sudah terbuat:
- `users`
- `document_types`
- `documents`
- `document_history`

## Langkah 4: Konfigurasi Environment

1. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit file `.env` sesuai konfigurasi database Anda:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=sikat_db
   DB_PORT=3306

   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key_here

   # File Upload Configuration
   UPLOAD_DIR=./public/uploads
   MAX_FILE_SIZE=5242880
   ```

## Langkah 5: Test Koneksi Database

Jalankan perintah untuk test koneksi database:

```bash
npm run dev
```

Kemudian buka browser dan akses:
```
http://localhost:3000/api/test-db
```

Jika berhasil, Anda akan melihat response JSON dengan informasi database.

## Langkah 6: Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

Aplikasi akan berjalan di: `http://localhost:3000`

## Langkah 7: Login ke Aplikasi

Gunakan akun demo yang sudah tersedia:

### Akun Guru
- Username: `guru123`
- Password: `password`

### Akun Admin
- Username: `admin123`
- Password: `password`

## Struktur Folder Project

```
Project-Manda/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard page
│   ├── documents/         # Documents pages
│   ├── login/            # Login page
│   ├── upload/           # Upload page
│   └── ...
├── components/            # React Components
│   ├── ui/               # UI Components (shadcn/ui)
│   └── shared/           # Shared Components
├── database/             # Database files
│   └── schema.sql        # Database schema
├── docs/                 # Documentation
├── lib/                  # Utilities and helpers
├── public/               # Static files
│   └── uploads/          # Uploaded files
└── ...
```

## Troubleshooting

### Error: Database Connection Failed

1. Pastikan MySQL server berjalan
2. Periksa konfigurasi database di file `.env`
3. Pastikan database `sikat_db` sudah dibuat
4. Periksa username dan password MySQL

### Error: Port 3000 Already in Use

Gunakan port lain:
```bash
npm run dev -- -p 3001
```

### Error: Permission Denied pada Folder Uploads

Pastikan folder `public/uploads` memiliki permission write:
```bash
chmod 755 public/uploads
```

### Error: Module Not Found

Hapus folder `node_modules` dan install ulang:
```bash
rm -rf node_modules
npm install
```

## Fitur Utama Aplikasi

1. **Login System** - Autentikasi pengguna
2. **Dashboard** - Overview statistik dokumen
3. **Upload Dokumen** - Upload berkas TPG
4. **Manajemen Dokumen** - Lihat dan kelola dokumen
5. **Riwayat** - Track perubahan dokumen
6. **Profil** - Kelola profil pengguna

## Konfigurasi Tambahan

### Mengubah Ukuran Maximum Upload

Edit file `.env`:
```env
MAX_FILE_SIZE=10485760  # 10MB dalam bytes
```

### Menambah Jenis Dokumen Baru

1. Login sebagai admin
2. Atau tambah langsung ke database:
   ```sql
   INSERT INTO document_types (name, description) 
   VALUES ('Nama Dokumen', 'Deskripsi dokumen');
   ```

### Backup Database

```bash
mysqldump -u root -p sikat_db > backup_sikat_db.sql
```

## Support

Jika mengalami masalah:

1. Periksa log error di terminal
2. Periksa file log aplikasi
3. Pastikan semua dependencies terinstall
4. Periksa konfigurasi database

## Update Aplikasi

Untuk update ke versi terbaru:

1. Backup database terlebih dahulu
2. Pull/download versi terbaru
3. Jalankan `npm install` untuk update dependencies
4. Jalankan migration database jika ada
5. Restart aplikasi

---

**Catatan**: Tutorial ini dibuat untuk environment development. Untuk production deployment, diperlukan konfigurasi tambahan untuk keamanan dan performa.
