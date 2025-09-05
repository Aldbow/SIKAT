# 🌐 Deploy SIKAT ke Hostinger

## 📋 **Prerequisites Hostinger**

### **Paket Hosting yang Diperlukan:**
- **Business Hosting** atau **Cloud Hosting** (mendukung Node.js)
- **MySQL Database** (included)
- **SSL Certificate** (gratis dari Hostinger)

⚠️ **Catatan**: Shared hosting biasa tidak mendukung Node.js, pastikan paket Anda mendukung Node.js applications.

## 🚀 **Langkah-langkah Deployment**

### **Step 1: Persiapan Database di Hostinger**

1. **Login ke hPanel Hostinger**
2. **Buat MySQL Database:**
   - Masuk ke "Databases" → "MySQL Databases"
   - Klik "Create Database"
   - Database Name: `sikat_db`
   - Username: `sikat_user`
   - Password: (buat password kuat)
   - Catat informasi database ini!

3. **Import Database Schema:**
   - Buka phpMyAdmin dari hPanel
   - Pilih database `sikat_db`
   - Import file SQL atau jalankan query dari `MYSQL_SETUP_TUTORIAL.md`

### **Step 2: Persiapan Aplikasi untuk Hostinger**

1. **Update Environment Variables:**

```env
# Database Configuration (Hostinger MySQL)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sikat_db
DB_USER=sikat_user
DB_PASSWORD=your_hostinger_db_password

# Production Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret_key_here

# File Upload Configuration (Hostinger)
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

2. **Update package.json untuk Hostinger:**

```json
{
  "name": "sikat-archival-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

3. **Buat file `.htaccess` untuk Hostinger:**

```apache
# .htaccess for Hostinger Node.js
RewriteEngine On

# Handle Angular and other client-side routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static files
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### **Step 3: Deploy ke Hostinger**

#### **Opsi A: Manual Upload (Recommended untuk Hostinger)**

1. **Build aplikasi lokal:**
```bash
npm run build
```

2. **Compress file yang diperlukan:**
   - Folder `.next/`
   - Folder `public/`
   - File `package.json`
   - File `next.config.js`
   - File `.env` (dengan konfigurasi production)
   - Folder `node_modules/` (atau install ulang di server)

3. **Upload via File Manager Hostinger:**
   - Login ke hPanel
   - Buka "File Manager"
   - Upload dan extract file ke `public_html/`

4. **Install Dependencies di Hostinger:**
   - Buka "Terminal" di hPanel (jika tersedia)
   - Atau gunakan SSH jika paket mendukung
   ```bash
   cd public_html
   npm install --production
   ```

#### **Opsi B: Git Deployment (Jika Hostinger mendukung)**

1. **Push ke Git Repository:**
```bash
git add .
git commit -m "Production build for Hostinger"
git push origin main
```

2. **Clone di Hostinger:**
```bash
cd public_html
git clone https://github.com/yourusername/sikat-archival-system.git .
npm install --production
npm run build
```

### **Step 4: Konfigurasi Hostinger untuk Node.js**

1. **Setup Node.js Application:**
   - Masuk ke hPanel → "Advanced" → "Node.js"
   - Klik "Create Application"
   - **Node.js Version**: 18.x atau terbaru
   - **Application Root**: `public_html`
   - **Application URL**: yourdomain.com
   - **Startup File**: `server.js` (buat file ini)

2. **Buat file `server.js`:**

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### **Step 5: Konfigurasi File Upload untuk Hostinger**

1. **Pastikan folder uploads writable:**
```bash
chmod 755 public/uploads
```

2. **Update konfigurasi upload jika diperlukan:**

```typescript
// app/api/documents/route.ts
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

// Pastikan folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
```

### **Step 6: SSL dan Domain Setup**

1. **Aktifkan SSL di Hostinger:**
   - hPanel → "Security" → "SSL/TLS"
   - Enable "Force HTTPS"

2. **Update DNS jika menggunakan domain custom:**
   - Point A record ke IP Hostinger
   - Wait for propagation (24-48 hours)

## 🔧 **Troubleshooting Hostinger**

### **Error: Node.js not supported**
- Pastikan paket hosting mendukung Node.js
- Upgrade ke Business/Cloud hosting jika perlu

### **Database Connection Error**
```javascript
// Cek koneksi database
const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })
    console.log('Database connected successfully')
    await connection.end()
  } catch (error) {
    console.error('Database connection failed:', error)
  }
}
```

### **File Upload Permission Error**
```bash
# Set proper permissions
chmod -R 755 public/uploads
chown -R $USER:$USER public/uploads
```

### **Memory/Resource Limits**
- Hostinger shared hosting memiliki limit resource
- Monitor penggunaan di hPanel
- Optimize aplikasi jika perlu

## 📊 **Monitoring di Hostinger**

### **Check Application Status:**
- hPanel → "Node.js" → View application status
- Check error logs di "Error Logs"

### **Database Monitoring:**
- phpMyAdmin untuk query database
- Monitor disk usage di hPanel

### **File Storage:**
- Monitor disk usage untuk uploads
- Setup backup strategy

## 💰 **Estimasi Biaya Hostinger**

- **Business Hosting**: ~$3-7/bulan
- **Cloud Hosting**: ~$10-15/bulan
- **Domain**: ~$10/tahun (jika belum punya)

## 🚀 **Go Live Checklist**

- [ ] Database created and imported
- [ ] Environment variables configured
- [ ] Application uploaded and built
- [ ] Node.js application configured
- [ ] SSL certificate activated
- [ ] Domain pointed correctly
- [ ] File upload tested
- [ ] All features tested
- [ ] Backup strategy implemented

## 📞 **Support**

Jika mengalami masalah:
1. **Hostinger Support**: Live chat 24/7
2. **Documentation**: Hostinger Knowledge Base
3. **Community**: Hostinger Community Forum

---

**💡 Tips**: Hostinger Business hosting sudah cukup untuk aplikasi SIKAT dengan traffic menengah. Untuk traffic tinggi, pertimbangkan Cloud hosting.
