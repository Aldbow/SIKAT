# 🗄️ Tutorial Setup Database MySQL untuk SIKAT

## 📋 Langkah 1: Install MySQL Server

### Windows:
1. Download MySQL Installer dari [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Pilih "MySQL Installer for Windows"
3. Jalankan installer dan pilih "Developer Default"
4. Ikuti wizard instalasi
5. **PENTING**: Catat password root yang Anda buat!

### Alternatif (XAMPP):
1. Download XAMPP dari [apachefriends.org](https://www.apachefriends.org/)
2. Install XAMPP
3. Buka XAMPP Control Panel
4. Start Apache dan MySQL

## 📋 Langkah 2: Akses MySQL

### Melalui Command Line:
```bash
mysql -u root -p
```
Masukkan password root yang sudah dibuat.

### Melalui phpMyAdmin (jika pakai XAMPP):
1. Buka browser: `http://localhost/phpmyadmin`
2. Login dengan username: `root`, password: (kosong atau sesuai setting)

## 📋 Langkah 3: Buat Database dan Tabel

Copy dan jalankan SQL berikut di MySQL:

```sql
-- 1. Buat database
CREATE DATABASE IF NOT EXISTS sikat_db;
USE sikat_db;

-- 2. Buat tabel users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    nip VARCHAR(20) UNIQUE NOT NULL,
    role ENUM('admin', 'guru', 'staff') DEFAULT 'guru',
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Buat tabel document_types
CREATE TABLE document_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Buat tabel documents
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    document_type_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    month_period INT NOT NULL,
    year_period INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    admin_notes TEXT,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- 5. Buat tabel document_history
CREATE TABLE document_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    action ENUM('created', 'updated', 'approved', 'rejected') NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Buat indexes untuk performa
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_period ON documents(year_period, month_period);
CREATE INDEX idx_document_history_document_id ON document_history(document_id);

-- 7. Insert data default - Document Types
INSERT INTO document_types (name, description) VALUES
('SKMT', 'Surat Keterangan Melaksanakan Tugas'),
('SKBK', 'Surat Keterangan Beban Kerja'),
('SPMJ', 'Surat Pernyataan Melaksanakan Jam'),
('Surat Pernyataan Memenuhi Administrasi', 'Surat pernyataan memenuhi persyaratan administrasi'),
('Daftar Hadir Bulanan', 'Daftar kehadiran bulanan guru'),
('Daftar Gaji Bulan', 'Daftar gaji bulanan'),
('Berita Acara', 'Berita acara kegiatan'),
('KGB', 'Kenaikan Gaji Berkala'),
('Surat Permohonan Kelayakan Dispensasi Tunjangan', 'Permohonan dispensasi tunjangan'),
('Surat Permohonan Pembayaran Tunjangan Profesi', 'Permohonan pembayaran tunjangan profesi'),
('Laporan Bulanan', 'Laporan kegiatan bulanan');

-- 8. Insert data default - Users (password: 'password')
INSERT INTO users (username, password, full_name, nip, role, email) VALUES
('admin123', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator SIKAT', '198001012005011001', 'admin', 'admin@sikat.kemenag.go.id'),
('guru123', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Guru Contoh', '197801012005011001', 'guru', 'guru@sikat.kemenag.go.id');

-- 9. Insert sample documents
INSERT INTO documents (user_id, document_type_id, title, file_name, file_path, file_size, mime_type, month_period, year_period, status, notes) VALUES
(2, 1, 'SKMT Januari 2025', 'skmt_jan_2025.pdf', '/uploads/skmt_jan_2025.pdf', 1024000, 'application/pdf', 1, 2025, 'approved', 'Dokumen lengkap dan sesuai'),
(2, 2, 'SKBK Januari 2025', 'skbk_jan_2025.pdf', '/uploads/skbk_jan_2025.pdf', 856000, 'application/pdf', 1, 2025, 'pending', 'Menunggu verifikasi'),
(2, 3, 'SPMJ Desember 2024', 'spmj_dec_2024.pdf', '/uploads/spmj_dec_2024.pdf', 742000, 'application/pdf', 12, 2024, 'rejected', 'Dokumen tidak lengkap, mohon dilengkapi');
```

## 📋 Langkah 4: Verifikasi Database

Jalankan query berikut untuk memastikan semua tabel berhasil dibuat:

```sql
-- Cek semua tabel
SHOW TABLES;

-- Cek data users
SELECT * FROM users;

-- Cek data document_types
SELECT * FROM document_types;

-- Cek data documents
SELECT * FROM documents;
```

## 📋 Langkah 5: Konfigurasi Aplikasi

Setelah database berhasil dibuat, edit file `.env`:

```env
# Database Configuration (MySQL for local development)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sikat_db
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sikat_secret_key_2024

# File Upload Configuration
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

**PENTING**: Ganti `your_mysql_password_here` dengan password MySQL root Anda!

## 🔧 Troubleshooting

### Error "Access denied for user 'root'@'localhost'":
- Pastikan password di `.env` sesuai dengan password MySQL
- Coba reset password MySQL root

### Error "Database 'sikat_db' doesn't exist":
- Pastikan sudah menjalankan `CREATE DATABASE sikat_db;`
- Cek nama database di `.env` sesuai

### Error "Connection refused":
- Pastikan MySQL service berjalan
- Cek port 3306 tidak diblokir firewall

## ✅ Test Koneksi

Setelah setup selesai, jalankan:

```bash
npm run dev
```

Buka `http://localhost:3000` dan coba login dengan:
- **Admin**: username `admin123`, password `password`
- **Guru**: username `guru123`, password `password`

---

**📞 Jika masih ada error, berikan pesan error lengkapnya untuk troubleshooting lebih lanjut.**
