# 🚀 Panduan Deployment SIKAT

Panduan lengkap untuk deploy aplikasi SIKAT ke berbagai platform.

## 📋 Persiapan Sebelum Deploy

### 1. Checklist Pre-Deploy

- [ ] Database schema sudah diimport
- [ ] Environment variables sudah dikonfigurasi
- [ ] Aplikasi berjalan dengan baik di development
- [ ] Build berhasil tanpa error
- [ ] File uploads folder sudah disiapkan

### 2. Environment Variables Production

Buat file `.env.production` dengan konfigurasi berikut:

```env
# Database Production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=sikat_db
DB_PORT=3306

# Application
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_very_secure_secret_key_here

# File Upload
UPLOAD_DIR=/var/www/uploads
MAX_FILE_SIZE=5242880
```

## 🌐 Deploy ke Vercel (Recommended)

### Langkah 1: Persiapan Database

1. **Setup Database Cloud** (PlanetScale/Railway/Supabase):
```bash
# Contoh dengan PlanetScale
pscale database create sikat-db
pscale branch create sikat-db main
```

2. **Import Schema**:
```bash
# Upload schema.sql ke database cloud Anda
mysql -h your-host -u your-user -p your-database < database/schema.sql
```

### Langkah 2: Deploy ke Vercel

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login ke Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

4. **Set Environment Variables**:
```bash
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

### Langkah 3: Konfigurasi Domain

1. Tambahkan domain custom di Vercel dashboard
2. Update DNS records:
   - Type: CNAME
   - Name: @ (atau subdomain)
   - Value: cname.vercel-dns.com

## 🖥️ Deploy ke VPS/Dedicated Server

### Langkah 1: Persiapan Server

1. **Update sistem**:
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install MySQL**:
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

4. **Install PM2**:
```bash
sudo npm install -g pm2
```

5. **Install Nginx**:
```bash
sudo apt install nginx -y
```

### Langkah 2: Setup Database

1. **Login ke MySQL**:
```bash
sudo mysql -u root -p
```

2. **Buat database dan user**:
```sql
CREATE DATABASE sikat_db;
CREATE USER 'sikat_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON sikat_db.* TO 'sikat_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. **Import schema**:
```bash
mysql -u sikat_user -p sikat_db < database/schema.sql
```

### Langkah 3: Deploy Aplikasi

1. **Clone repository**:
```bash
cd /var/www
sudo git clone <your-repo-url> sikat
sudo chown -R $USER:$USER /var/www/sikat
cd sikat
```

2. **Install dependencies**:
```bash
npm ci --production
```

3. **Setup environment**:
```bash
cp .env.example .env.production
nano .env.production
```

4. **Build aplikasi**:
```bash
npm run build
```

5. **Start dengan PM2**:
```bash
pm2 start npm --name "sikat" -- start
pm2 startup
pm2 save
```

### Langkah 4: Konfigurasi Nginx

1. **Buat konfigurasi Nginx**:
```bash
sudo nano /etc/nginx/sites-available/sikat
```

2. **Isi konfigurasi**:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Handle file uploads
    location /uploads {
        alias /var/www/sikat/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/sikat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Langkah 5: Setup SSL dengan Let's Encrypt

1. **Install Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Generate SSL certificate**:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🐳 Deploy dengan Docker

### Langkah 1: Buat Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Langkah 2: Buat docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_USER=sikat_user
      - DB_PASSWORD=secure_password
      - DB_NAME=sikat_db
    depends_on:
      - db
    volumes:
      - ./uploads:/app/public/uploads

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=sikat_db
      - MYSQL_USER=sikat_user
      - MYSQL_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

### Langkah 3: Deploy

```bash
docker-compose up -d
```

## ☁️ Deploy ke Cloud Platforms

### Heroku

1. **Install Heroku CLI**:
```bash
npm install -g heroku
```

2. **Login dan create app**:
```bash
heroku login
heroku create sikat-app
```

3. **Add database addon**:
```bash
heroku addons:create jawsdb:kitefin
```

4. **Set environment variables**:
```bash
heroku config:set NEXTAUTH_URL=https://sikat-app.herokuapp.com
heroku config:set NEXTAUTH_SECRET=your_secret
```

5. **Deploy**:
```bash
git push heroku main
```

### Railway

1. **Connect GitHub repository** di Railway dashboard
2. **Add MySQL database** dari Railway marketplace
3. **Set environment variables** di dashboard
4. **Deploy otomatis** dari GitHub

### DigitalOcean App Platform

1. **Connect repository** di DigitalOcean dashboard
2. **Add managed database** (MySQL)
3. **Configure environment variables**
4. **Deploy**

## 🔧 Post-Deployment Checklist

### 1. Verifikasi Deployment

- [ ] Aplikasi dapat diakses via URL
- [ ] Login berfungsi dengan akun demo
- [ ] Upload file berjalan normal
- [ ] Database connection stabil
- [ ] SSL certificate aktif (jika menggunakan HTTPS)

### 2. Monitoring Setup

1. **Setup PM2 monitoring** (untuk VPS):
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

2. **Setup log monitoring**:
```bash
# View logs
pm2 logs sikat

# Monitor resources
pm2 monit
```

### 3. Backup Strategy

1. **Database backup script**:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u sikat_user -p sikat_db > /backup/sikat_db_$DATE.sql
```

2. **Setup cron job**:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup_script.sh
```

## 🚨 Troubleshooting Deployment

### Common Issues

1. **Database Connection Error**:
   - Periksa environment variables
   - Pastikan database server berjalan
   - Cek firewall rules

2. **Build Failures**:
   - Periksa Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules dan reinstall

3. **File Upload Issues**:
   - Periksa permission folder uploads
   - Pastikan disk space cukup
   - Cek nginx client_max_body_size

4. **SSL Certificate Issues**:
   - Renew certificate: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

### Performance Optimization

1. **Enable Gzip compression** di Nginx:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

2. **Setup caching**:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📞 Support

Jika mengalami masalah deployment:

- **Email**: tech-support@sikat.kemenag.go.id
- **Documentation**: Lihat README.md untuk troubleshooting umum
- **Logs**: Selalu periksa application logs untuk error details

---

**Catatan**: Pastikan untuk mengganti semua placeholder (yourdomain.com, passwords, etc.) dengan nilai yang sesuai untuk environment Anda.
