# SIKAT - Production Deployment Guide

Panduan deployment aplikasi SIKAT untuk production environment.

## Deployment Options

### 1. VPS/Dedicated Server Deployment

#### Prerequisites
- Ubuntu 20.04+ atau CentOS 8+
- Node.js 18+
- MySQL 8.0+
- Nginx (recommended)
- SSL Certificate
- Domain name

#### Steps

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Database Setup**
   ```bash
   sudo mysql -u root -p
   CREATE DATABASE sikat_db;
   CREATE USER 'sikat_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON sikat_db.* TO 'sikat_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Application Deployment**
   ```bash
   # Clone repository
   git clone <repository-url> /var/www/sikat
   cd /var/www/sikat
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.example .env
   # Edit .env with production values
   
   # Import database schema
   mysql -u sikat_user -p sikat_db < database/schema.sql
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "sikat" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/sikat
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
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
       
       location /uploads {
           alias /var/www/sikat/public/uploads;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/sikat /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 2. Hostinger Shared Hosting Deployment

#### Prerequisites
- Hostinger hosting plan with Node.js support
- MySQL database access
- File manager or FTP access

#### Steps

1. **Prepare Application**
   ```bash
   # Local machine - build for production
   npm run build
   
   # Create deployment package
   zip -r sikat-production.zip . -x "node_modules/*" ".git/*" ".next/*"
   ```

2. **Upload Files**
   - Upload zip file via File Manager
   - Extract in public_html directory
   - Install dependencies via SSH or Node.js app manager

3. **Database Setup**
   - Create MySQL database via cPanel
   - Import schema.sql via phpMyAdmin
   - Update .env with database credentials

4. **Configure Environment**
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   NEXTAUTH_URL=https://yourdomain.com
   ```

### 3. Docker Deployment

#### Dockerfile
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

#### docker-compose.yml
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
      - ./public/uploads:/app/public/uploads

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

volumes:
  mysql_data:
```

## Production Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=sikat_user
DB_PASSWORD=very_secure_password
DB_NAME=sikat_db
DB_PORT=3306

# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=very_long_random_secret_key

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880

# Security
ALLOWED_ORIGINS=https://yourdomain.com
```

## Security Considerations

### 1. Database Security
- Use strong passwords
- Limit database user privileges
- Enable SSL connections
- Regular backups

### 2. File Upload Security
- Validate file types strictly
- Scan uploaded files for malware
- Limit file sizes
- Store uploads outside web root if possible

### 3. Application Security
- Use HTTPS only
- Implement rate limiting
- Regular security updates
- Monitor logs for suspicious activity

### 4. Server Security
- Keep OS updated
- Configure firewall
- Use fail2ban for SSH protection
- Regular security audits

## Monitoring and Maintenance

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs sikat

# Restart application
pm2 restart sikat
```

### 2. Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u sikat_user -p sikat_db > /backup/sikat_db_$DATE.sql
find /backup -name "sikat_db_*.sql" -mtime +7 -delete
```

### 3. Log Rotation
```bash
# /etc/logrotate.d/sikat
/var/www/sikat/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## Performance Optimization

### 1. Database Optimization
- Add proper indexes
- Optimize queries
- Regular maintenance
- Connection pooling

### 2. Application Optimization
- Enable compression
- Optimize images
- Use CDN for static assets
- Implement caching

### 3. Server Optimization
- Configure Nginx caching
- Enable gzip compression
- Optimize PHP-FPM (if applicable)
- Monitor resource usage

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify database connection
   - Check file permissions

2. **File upload fails**
   - Check upload directory permissions
   - Verify file size limits
   - Check disk space

3. **Database connection errors**
   - Verify credentials
   - Check MySQL service status
   - Review firewall settings

### Logs Location
- Application logs: `/var/www/sikat/logs/`
- Nginx logs: `/var/log/nginx/`
- MySQL logs: `/var/log/mysql/`
- PM2 logs: `~/.pm2/logs/`

## Backup Strategy

### 1. Database Backup
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Test restore procedures

### 2. File Backup
- Daily backup of uploaded files
- Sync to cloud storage
- Version control for code

### 3. Configuration Backup
- Backup server configurations
- Document all custom settings
- Keep deployment scripts updated

## Update Procedure

1. **Backup current version**
2. **Test updates in staging**
3. **Schedule maintenance window**
4. **Deploy updates**
5. **Verify functionality**
6. **Monitor for issues**

---

**Important**: Always test deployment procedures in a staging environment before applying to production.
