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
