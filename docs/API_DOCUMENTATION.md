# SIKAT - API Documentation

Dokumentasi lengkap API endpoints untuk aplikasi SIKAT.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Aplikasi menggunakan session-based authentication dengan localStorage untuk demo purposes.

## API Endpoints

### Authentication

#### POST /api/auth/login
Login pengguna ke sistem.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "username": "guru123",
    "full_name": "Guru Contoh",
    "nip": "197801012005011001",
    "role": "guru",
    "email": "guru@sikat.kemenag.go.id"
  }
}
```

**Response (Error):**
```json
{
  "message": "Username atau password salah"
}
```

### Documents

#### GET /api/documents
Mengambil daftar dokumen dengan pagination dan filter.

**Query Parameters:**
- `userId` (optional): Filter berdasarkan user ID
- `limit` (optional): Jumlah data per halaman (default: 10)
- `offset` (optional): Offset untuk pagination (default: 0)
- `status` (optional): Filter berdasarkan status (pending/approved/rejected)
- `documentType` (optional): Filter berdasarkan tipe dokumen
- `search` (optional): Pencarian berdasarkan judul

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "title": "SKMT Januari 2025",
      "file_name": "skmt_jan_2025.pdf",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      "month_period": 1,
      "year_period": 2025,
      "status": "approved",
      "created_at": "2025-01-01T00:00:00.000Z",
      "document_type_name": "SKMT",
      "user_name": "Guru Contoh"
    }
  ],
  "total": 1,
  "message": "Documents retrieved successfully"
}
```

#### POST /api/documents
Upload dokumen baru.

**Request (FormData):**
- `userId`: ID pengguna
- `documentTypeId`: ID tipe dokumen
- `title`: Judul dokumen
- `monthPeriod`: Bulan periode (1-12)
- `yearPeriod`: Tahun periode
- `notes`: Catatan (optional)
- `file`: File yang diupload

**Response:**
```json
{
  "message": "Dokumen berhasil diunggah",
  "documentId": 123
}
```

#### GET /api/documents/[id]
Mengambil detail dokumen berdasarkan ID.

**Response:**
```json
{
  "document": {
    "id": 1,
    "title": "SKMT Januari 2025",
    "file_name": "skmt_jan_2025.pdf",
    "file_path": "/uploads/skmt_jan_2025.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "month_period": 1,
    "year_period": 2025,
    "status": "approved",
    "notes": "Dokumen lengkap dan sesuai",
    "admin_notes": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "reviewed_at": "2025-01-02T00:00:00.000Z",
    "document_type_name": "SKMT",
    "user_name": "Guru Contoh",
    "reviewed_by_name": "Administrator SIKAT"
  },
  "message": "Document retrieved successfully"
}
```

#### GET /api/documents/[id]/file
Download atau preview file dokumen.

**Response:**
- File binary dengan appropriate Content-Type header
- Content-Disposition: inline untuk preview

#### GET /api/documents/stats
Mengambil statistik dokumen pengguna.

**Query Parameters:**
- `userId`: ID pengguna (required)

**Response:**
```json
{
  "stats": {
    "total": 10,
    "approved": 5,
    "pending": 3,
    "rejected": 2
  },
  "message": "Stats retrieved successfully"
}
```

### Document Types

#### GET /api/document-types
Mengambil daftar tipe dokumen yang aktif.

**Response:**
```json
{
  "documentTypes": [
    {
      "id": 1,
      "name": "SKMT",
      "description": "Surat Keterangan Melaksanakan Tugas",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "Document types retrieved successfully"
}
```

### Profile

#### PUT /api/profile
Update profil pengguna.

**Request Body:**
```json
{
  "userId": 1,
  "full_name": "Nama Lengkap Baru",
  "email": "email@example.com",
  "phone": "081234567890",
  "current_password": "password_lama",
  "new_password": "password_baru"
}
```

**Response:**
```json
{
  "message": "Profil berhasil diperbarui",
  "user": {
    "id": 1,
    "username": "guru123",
    "full_name": "Nama Lengkap Baru",
    "nip": "197801012005011001",
    "role": "guru",
    "email": "email@example.com",
    "phone": "081234567890"
  }
}
```

### Database Test

#### GET /api/test-db
Test koneksi database dan menampilkan statistik.

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "users": { "user_count": 2 },
    "documentTypes": { "doc_type_count": 11 },
    "documents": { "doc_count": 3 }
  }
}
```

## Error Responses

Semua endpoint dapat mengembalikan error response dengan format:

```json
{
  "message": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## File Upload Specifications

### Allowed File Types
- PDF: `application/pdf`
- JPEG: `image/jpeg`
- PNG: `image/png`

### File Size Limit
- Maximum: 5MB (5,242,880 bytes)

### Upload Directory
- Files are stored in: `public/uploads/`
- File naming: `{timestamp}_{original_filename}`

## Database Schema

### Users Table
```sql
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
```

### Documents Table
```sql
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
```

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider implementing:

- Login attempts: 5 attempts per 15 minutes
- File uploads: 10 uploads per hour per user
- API calls: 100 requests per minute per IP

## Security Considerations

1. **Input Validation**: All inputs are validated and sanitized
2. **File Upload Security**: File types and sizes are strictly validated
3. **SQL Injection Prevention**: Using parameterized queries
4. **Authentication**: Session-based authentication (demo implementation)

## Example Usage

### JavaScript/Fetch Examples

#### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'guru123',
    password: 'password'
  })
});

const data = await response.json();
if (response.ok) {
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

#### Upload Document
```javascript
const formData = new FormData();
formData.append('userId', '1');
formData.append('documentTypeId', '1');
formData.append('title', 'SKMT Januari 2025');
formData.append('monthPeriod', '1');
formData.append('yearPeriod', '2025');
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/documents', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

#### Get Documents
```javascript
const response = await fetch('/api/documents?userId=1&limit=10&offset=0');
const data = await response.json();
console.log(data.documents);
```

---

**Note**: This API documentation is for the current version of SIKAT. For production deployment, additional security measures and authentication mechanisms should be implemented.
