# Environment Setup Guide

This guide explains how to set up your development environment for ZER08.

## Required Software

1. **Node.js (v18 or higher)**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm (v9 or higher)**
   - Comes with Node.js
   - Verify installation: `npm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

## Environment Variables

Create a `.env.local` file in the project root with these variables:

```bash
# Supabase Configuration (Server-side only)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URLs
SITE_URL=http://localhost:3000
```

### Getting Supabase Credentials

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the URL and anon key
4. Never commit these credentials to version control

## Development Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

The Supabase database will be set up with necessary tables as we progress through development phases:

1. Users table
2. API Keys table
3. Jobs table
4. Job Logs table
5. Usage & Billing tables

## GitHub Actions Setup

For the cron functionality (Phase 5), you'll need:
1. GitHub repository secrets for Supabase credentials
2. Workflow file for 1-minute interval job execution

## Common Issues

### Port Already in Use
If port 3000 is already in use:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Unix
lsof -i :3000
kill -9 <PID>
```

### Environment Variables Not Loading
- Ensure `.env.local` is in the root directory
- Restart the development server
- Check for typos in variable names

## Next Steps

After environment setup:
1. Read the [Contributing Guidelines](CONTRIBUTING.md)
2. Check the [Project Roadmap](roadmap.md)
3. Pick an issue to work on 