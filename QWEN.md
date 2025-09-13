# SIKAT - Sistem Informasi Kearsipan Terpusat

## Project Overview

SIKAT (Sistem Informasi Kearsipan Terpusat) is a centralized document management system built for the Ministry of Religion in North Nias Regency, Indonesia. The application is designed to help teachers manage their Teaching Professional Allowance (TPG) documents.

The project is built with:
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MySQL
- **Authentication**: Custom JWT-based authentication
- **File Upload**: Multer for local storage (development), with plans to use Vercel Blob for production deployments

## Project Structure

```
SIKAT/
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

## Building and Running

### Prerequisites
- Node.js 18.0 or later
- MySQL 8.0 or later
- npm or yarn package manager

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE sikat_db;
   EXIT;

   # Import database schema
   mysql -u root -p sikat_db < database/schema.sql
   ```

3. Configure environment variables:
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env file with your database credentials
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sikat_db
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Deployment

### Deploying to Vercel with Vercel Blob

The project includes documentation for deploying to Vercel with Vercel Blob for file storage:
- [Vercel Deployment with Blob Documentation](docs/VERCEL_DEPLOYMENT_WITH_BLOB.md)

Key steps include:
1. Creating a Blob Store in Vercel Dashboard
2. Installing the `@vercel/blob` package
3. Updating API routes to use Vercel Blob instead of local file storage
4. Configuring environment variables in Vercel

### Deploying to Traditional VPS/Server

1. Upload files to server
2. Install dependencies:
   ```bash
   npm ci --production
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Run with PM2:
   ```bash
   pm2 start npm --name "sikat" -- start
   ```

## Development Conventions

### Code Style
- TypeScript is used throughout the project for type safety
- Tailwind CSS is used for styling with a component-based approach
- shadcn/ui components are used for UI elements

### API Routes
- API routes follow REST conventions where possible
- Error handling is implemented with try/catch blocks
- Database queries are handled through the `executeQuery` helper in `lib/db.ts`

### Database
- MySQL is used as the primary database
- Database connections are managed through a connection pool
- Queries are parameterized to prevent SQL injection

### Authentication
- Custom JWT-based authentication is implemented
- Protected routes check for valid session tokens
- Passwords are hashed using bcrypt

### File Upload
- File uploads are handled through API routes that process FormData
- File type and size validation is implemented
- In development, files are stored locally in the `public/uploads` directory
- For production deployments, Vercel Blob is recommended for scalable file storage

## Key Files to Know

- `README.md` - Main project documentation
- `docs/VERCEL_DEPLOYMENT_WITH_BLOB.md` - Detailed guide for deploying to Vercel with Vercel Blob
- `lib/db.ts` - Database connection and query execution
- `app/api/documents/route.ts` - Document management API endpoints
- `database/schema.sql` - Database schema definition
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `package.json` - Project dependencies and scripts

## Environment Variables

The project requires the following environment variables:
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `NEXTAUTH_URL` - NextAuth URL (for production)
- `NEXTAUTH_SECRET` - NextAuth secret (for production)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (for production with Vercel Blob)

## Troubleshooting

### Database Connection Error
- Ensure MySQL service is running
- Check database credentials in `.env.local`
- Verify that the `sikat_db` database has been created

### File Upload Error
- Check permissions on the `public/uploads` folder
- Ensure file size does not exceed 5MB
- Verify that only PDF, JPG, PNG files are being uploaded

### Build Error
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (minimum 18.0)