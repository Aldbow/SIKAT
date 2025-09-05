const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sikat.db');

// Remove existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Existing database removed');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('Creating database tables...');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      nip TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'guru' CHECK(role IN ('admin', 'guru', 'staff')),
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Document types table
  CREATE TABLE document_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Documents table
  CREATE TABLE documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      document_type_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      month_period INTEGER NOT NULL,
      year_period INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      notes TEXT,
      admin_notes TEXT,
      reviewed_by INTEGER NULL,
      reviewed_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (document_type_id) REFERENCES document_types(id),
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
  );

  -- Document history table
  CREATE TABLE document_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('created', 'updated', 'approved', 'rejected')),
      old_status TEXT,
      new_status TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Create indexes
  CREATE INDEX idx_documents_user_id ON documents(user_id);
  CREATE INDEX idx_documents_status ON documents(status);
  CREATE INDEX idx_documents_period ON documents(year_period, month_period);
  CREATE INDEX idx_document_history_document_id ON document_history(document_id);
`);

console.log('Tables created successfully');

// Insert default document types
console.log('Inserting document types...');
const insertDocTypes = db.prepare(`
  INSERT INTO document_types (name, description) VALUES (?, ?)
`);

const docTypes = [
  ['SKMT', 'Surat Keterangan Melaksanakan Tugas'],
  ['SKBK', 'Surat Keterangan Beban Kerja'],
  ['SPMJ', 'Surat Pernyataan Melaksanakan Jam'],
  ['Surat Pernyataan Memenuhi Administrasi', 'Surat pernyataan memenuhi persyaratan administrasi'],
  ['Daftar Hadir Bulanan', 'Daftar kehadiran bulanan guru'],
  ['Daftar Gaji Bulan', 'Daftar gaji bulanan'],
  ['Berita Acara', 'Berita acara kegiatan'],
  ['KGB', 'Kenaikan Gaji Berkala'],
  ['Surat Permohonan Kelayakan Dispensasi Tunjangan', 'Permohonan dispensasi tunjangan'],
  ['Surat Permohonan Pembayaran Tunjangan Profesi', 'Permohonan pembayaran tunjangan profesi'],
  ['Laporan Bulanan', 'Laporan kegiatan bulanan']
];

for (const [name, description] of docTypes) {
  insertDocTypes.run(name, description);
}

console.log('Document types inserted');

// Insert default users
console.log('Inserting default users...');
const hashedPassword = bcrypt.hashSync('password', 10);

const insertUsers = db.prepare(`
  INSERT INTO users (username, password, full_name, nip, role, email) VALUES (?, ?, ?, ?, ?, ?)
`);

insertUsers.run('admin123', hashedPassword, 'Administrator SIKAT', '198001012005011001', 'admin', 'admin@sikat.kemenag.go.id');
insertUsers.run('guru123', hashedPassword, 'Guru Contoh', '197801012005011001', 'guru', 'guru@sikat.kemenag.go.id');

console.log('Default users inserted');

// Insert sample documents
console.log('Inserting sample documents...');
const insertDocs = db.prepare(`
  INSERT INTO documents (user_id, document_type_id, title, file_name, file_path, file_size, mime_type, month_period, year_period, status, notes) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertDocs.run(2, 1, 'SKMT Januari 2025', 'skmt_jan_2025.pdf', '/uploads/skmt_jan_2025.pdf', 1024000, 'application/pdf', 1, 2025, 'approved', 'Dokumen lengkap dan sesuai');
insertDocs.run(2, 2, 'SKBK Januari 2025', 'skbk_jan_2025.pdf', '/uploads/skbk_jan_2025.pdf', 856000, 'application/pdf', 1, 2025, 'pending', 'Menunggu verifikasi');
insertDocs.run(2, 3, 'SPMJ Desember 2024', 'spmj_dec_2024.pdf', '/uploads/spmj_dec_2024.pdf', 742000, 'application/pdf', 12, 2024, 'rejected', 'Dokumen tidak lengkap, mohon dilengkapi');

console.log('Sample documents inserted');

// Verify data
console.log('\nVerifying database...');
const users = db.prepare('SELECT username, full_name, role FROM users').all();
console.log('Users in database:');
users.forEach(user => {
  console.log(`- ${user.username} (${user.full_name}) - ${user.role}`);
});

const docTypesCount = db.prepare('SELECT COUNT(*) as count FROM document_types').get();
console.log(`Document types: ${docTypesCount.count}`);

const docsCount = db.prepare('SELECT COUNT(*) as count FROM documents').get();
console.log(`Sample documents: ${docsCount.count}`);

db.close();
console.log('\nDatabase initialization completed successfully!');
console.log('You can now login with:');
console.log('- Username: admin123, Password: password (Admin)');
console.log('- Username: guru123, Password: password (Guru)');
