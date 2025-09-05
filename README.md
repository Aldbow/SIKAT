# SIKAT - Sistem Informasi Kearsipan Terpusat

Sistem Informasi Kearsipan Terpusat untuk Kementerian Agama Kabupaten Nias Utara yang dibangun dengan Next.js, TypeScript, Tailwind CSS, dan MySQL.

## 🚀 Fitur Utama

- **Autentikasi Pengguna**: Login dengan username dan password
- **Dashboard Interaktif**: Statistik berkas dan overview sistem
- **Upload Berkas**: Upload dokumen TPG dengan validasi
- **Manajemen Berkas**: Lihat riwayat dan status verifikasi
- **Profil Pengguna**: Edit informasi dan ubah password
- **Responsive Design**: Tampilan yang optimal di semua perangkat

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: MySQL
- **Authentication**: Custom JWT-based auth
- **File Upload**: Multer (untuk production)

## Setup dan Instalasi

### Prerequisites
- Node.js 18+ 
- npm atau yarn

- **Node.js** 18.0 or later
- **MySQL** 8.0 or later
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Project-Manda
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE sikat_db;
EXIT;

# Import database schema
mysql -u root -p sikat_db < database/schema.sql
```

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sikat_db
```

### 5. Run the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Default Login Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin123 | password |
| Guru  | guru123  | password |

## 📁 Project Structure

```
Project-Manda/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── documents/     # Document management endpoints
│   │   ├── document-types/# Document type endpoints
│   │   └── profile/       # User profile endpoints
│   ├── dashboard/         # Dashboard page
│   ├── documents/         # Document management pages
│   ├── login/            # Authentication page
│   ├── upload/           # File upload page
│   ├── profile/          # User profile page
│   └── history/          # Document history page
├── components/            # React Components
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Shared/reusable components
├── database/             # Database files
│   └── schema.sql        # Database schema
├── docs/                 # Documentation
│   ├── SETUP_TUTORIAL.md # Setup guide
│   ├── PRODUCTION_DEPLOYMENT.md # Production deployment
│   └── API_DOCUMENTATION.md # API documentation
├── lib/                  # Utilities and helpers
│   ├── db.ts            # Database connection
│   ├── utils.ts         # Utility functions
│   ├── types.ts         # TypeScript type definitions
│   ├── constants.ts     # Application constants
│   └── helpers.ts       # Helper functions
├── public/               # Static files
│   └── uploads/         # Uploaded documents
└── ...
```

## 📚 Documentation
## 🗄️ Database Schema

### Tabel Utama:

1. **users** - Data pengguna sistem
2. **document_types** - Jenis-jenis dokumen TPG
3. **documents** - Data dokumen yang diupload
4. **document_history** - Riwayat perubahan dokumen

### Jenis Dokumen TPG:

- SKMT (Surat Keterangan Melaksanakan Tugas)
- SKBK (Surat Keterangan Beban Kerja)
- SPMJ (Surat Pernyataan Melaksanakan Jam)
- Surat Pernyataan Memenuhi Administrasi
- Daftar Hadir Bulanan
- Daftar Gaji Bulan
- Berita Acara
- KGB (Kenaikan Gaji Berkala)
- Dan lainnya...

## 🔒 Keamanan

- Password di-hash menggunakan bcrypt
- Validasi input pada semua form
- Sanitasi data sebelum disimpan ke database
- Validasi tipe dan ukuran file upload

## 📱 Fitur Responsive

Aplikasi telah dioptimalkan untuk:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder `docs/`:

- **[Panduan Deployment](docs/DEPLOYMENT.md)** - Panduan deployment umum
- **[Arsitektur Deployment](docs/DEPLOYMENT_ARCHITECTURE.md)** - Arsitektur sistem deployment
- **[Deployment Hostinger](docs/HOSTINGER_DEPLOYMENT.md)** - Panduan khusus deployment ke Hostinger
- **[Setup MySQL](docs/MYSQL_SETUP_TUTORIAL.md)** - Tutorial lengkap setup MySQL

## 🚀 Deployment

### Persiapan Production

1. Build aplikasi:
```bash
npm run build
```

2. Setup environment production di `.env.production`:
```env
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=sikat_db
NEXTAUTH_URL=https://yourdomain.com
```

### Deploy ke Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Deploy ke VPS/Server

1. Upload files ke server
2. Install dependencies:
```bash
npm ci --production
```

3. Build aplikasi:
```bash
npm run build
```

4. Jalankan dengan PM2:
```bash
pm2 start npm --name "sikat" -- start
```

## 🔧 Troubleshooting

### Database Connection Error
- Pastikan MySQL service berjalan
- Periksa kredensial database di `.env.local`
- Pastikan database `sikat_db` sudah dibuat

### File Upload Error
- Periksa permission folder `public/uploads`
- Pastikan ukuran file tidak melebihi 5MB
- Hanya file PDF, JPG, PNG yang diizinkan

### Build Error
- Jalankan `npm install` untuk memastikan semua dependencies terinstall
- Periksa versi Node.js (minimal 18.0)

## 📞 Support

Jika mengalami masalah atau butuh bantuan:

- **Email**: help@sikat.kemenag.go.id
- **WhatsApp**: 0812-3456-7890
- **Jam Operasional**: 08:00 - 16:00 WIB

## 📄 License

Copyright © 2025 Kementerian Agama Kabupaten Nias Utara. All rights reserved.
