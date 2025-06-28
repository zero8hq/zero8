# ZER08 - Open Source API-Based Cron Scheduler

ZER08 (pronounced "zero-eight") is an open-source, self-hostable, API-first scheduling platform that enables developers to define and trigger webhooks based on custom time logic — with zero server management.

## 🚀 Features

- API-first webhook scheduling
- Fine-grained scheduling options (daily, weekly, monthly, custom intervals)
- Multiple trigger times per day
- Metadata handling for webhooks
- Multi-tenant support with API key authentication
- Built on reliable, modern stack (Next.js, Supabase, GitHub Actions)

## 🛠 Tech Stack

- **Frontend/API**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **Cron Engine**: GitHub Actions
- **Hosting**: Vercel (UI/API)

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

## 🔧 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zero8.git
   cd zero8
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     SITE_URL=http://localhost:3000
     ```

4. **Start the development server**
```bash
npm run dev
   ```
   The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
zero8/
├── docs/              # Documentation files
├── public/            # Static assets
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   └── utils/        # Utility functions
└── package.json
```

## 🕒 Job Scheduler

The job scheduling engine is a core feature of ZER08 that enables the execution of scheduled jobs based on various frequency patterns.

### Scheduler Architecture
- **External Cron Service**: Uses [cron-jobs.com](https://cron-jobs.org) to trigger the scheduler every minute
- **API Endpoint**: `/api/jobs/trigger` processes jobs and sends webhooks
- **Security**: Requests between the cron service and the API are authenticated using a shared secret

### Job Frequency Types
1. **Daily**: Jobs that run at specific times every day
2. **Custom**: Jobs that run based on complex rules:
   - Weekly: Run on specific days of the week
   - Monthly: Run on specific days of the month
   - Interval: Run every N days
   - Override dates: Run on specific calendar dates
3. **Recurring**: Jobs that run at fixed intervals (minutes/hours)

### Webhook Payload
When a job is triggered, ZER08 sends a POST request to the job's callback URL with the following payload:
```json
{
  "metadata": { /* Your custom metadata */ },
  "job_id": "uuid",
  "triggered_at": "2023-04-15T14:22:00Z"
}
```

### Setting Up Cron Service
For deployment, you'll need to:
1. Create an account on [cron-jobs.com](https://cron-jobs.org)
2. Set up a new cron job with:
   - URL: `https://your-app-url.com/api/jobs/trigger`
   - Method: `POST`
   - Headers: `x-auth-token: your_secure_secret`
   - Schedule: Every 1 minute
3. Add the same secret to your environment variables as `CRON_JOB_SECRET`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- Website: [zero8.pro](https://zero8.pro)
- Documentation: [docs.zero8.pro](https://docs.zero8.pro)
- GitHub Repository: [github.com/yourusername/zero8](https://github.com/yourusername/zero8)

## 📞 Support

For support, please:
1. Check our [documentation](https://docs.zero8.pro)
2. Open an issue on GitHub
3. Join our community discussions

## API Key Authentication

### Overview
Zero8 provides API key authentication for secure access to API endpoints. This allows you to integrate Zero8 services with your applications while maintaining security.

### Using API Keys
1. Generate an API key from the dashboard.
2. Include the API key in your requests using the `x-api-key` header.

Example:
```bash
curl -X GET https://your-zero8-app.com/api/protected-endpoint \
  -H "x-api-key: your-api-key-here"
```

### Protected Endpoints
The following endpoints require API key authentication:
- `/api/protected-example` - Example protected endpoint
- Additional endpoints as documented in the API reference

### API Key Management
- API keys can be created, viewed, and revoked from the dashboard.
- Each key can be named for easy identification.
- Keys are shown only once at creation time - store them securely.
- Inactive keys will be automatically rejected.
