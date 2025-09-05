-- SIKAT Database Schema
-- Sistem Informasi Kearsipan Terpusat

CREATE DATABASE IF NOT EXISTS sikat_db;
USE sikat_db;

-- Users table
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

-- Document types table
CREATE TABLE document_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
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

-- Document history table for tracking changes
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

-- Insert default document types
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

-- Insert default users
INSERT INTO users (username, password, full_name, nip, role, email) VALUES
('admin123', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator SIKAT', '198001012005011001', 'admin', 'admin@sikat.kemenag.go.id'),
('guru123', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Guru Contoh', '197801012005011001', 'guru', 'guru@sikat.kemenag.go.id');

-- Insert sample documents
INSERT INTO documents (user_id, document_type_id, title, file_name, file_path, file_size, mime_type, month_period, year_period, status, notes) VALUES
(2, 1, 'SKMT Januari 2025', 'skmt_jan_2025.pdf', '/uploads/skmt_jan_2025.pdf', 1024000, 'application/pdf', 1, 2025, 'approved', 'Dokumen lengkap dan sesuai'),
(2, 2, 'SKBK Januari 2025', 'skbk_jan_2025.pdf', '/uploads/skbk_jan_2025.pdf', 856000, 'application/pdf', 1, 2025, 'pending', 'Menunggu verifikasi'),
(2, 3, 'SPMJ Desember 2024', 'spmj_dec_2024.pdf', '/uploads/spmj_dec_2024.pdf', 742000, 'application/pdf', 12, 2024, 'rejected', 'Dokumen tidak lengkap, mohon dilengkapi');

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_period ON documents(year_period, month_period);
CREATE INDEX idx_document_history_document_id ON document_history(document_id);
