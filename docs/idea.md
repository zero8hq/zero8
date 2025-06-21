# ZER08: Open Source API-Based Cron Scheduler

ZER08 (read: "zero-eight") is an open source, self-hostable, API-first scheduling platform that enables developers to define and trigger webhooks based on custom time logic — with zero server management. Built using Next.js, Supabase, and GitHub Actions, ZER08 supports fine-grained recurring schedules, metadata handling, and works as a backend automation layer.

---

## ✨ Branding: ZER08 (zero8)

The project is branded as ZER08 (read: "zero-eight"). The name visually combines the concepts of:

- 0 → starting point / minimal effort
- 8 → infinite loop / continuous schedule
- ZER08 → stylized identity, future-proof for a scheduling-focused infrastructure product

We own the domain: zero8.pro, which will serve as the main hosted product portal for ZER08 (the open-source scheduler engine behind it).

---

## 📦 Tech Stack

- Frontend/API: Next.js (App Router)
- DB: Supabase (PostgreSQL + RLS)
- Cron Execution Engine: GitHub Actions (1-min interval)
- Hosting: Vercel (for UI/API), GitHub, Supabase
- Dev Tooling: Cursor AI, Copilot, etc.

---

## 🔄 Use Case Summary

Third-party apps can send a POST request to ZER08 with metadata and time-based trigger rules. ZER08 stores this info in a DB. A GitHub Action polls every minute, evaluates all stored schedules, and triggers matching callbacks via HTTP POST to the original callback_url, passing along metadata.

---

## 📥 Schedule Job: API Input

POST /api/schedule

Example payload:

```json
{
  "start_date": "2025-06-20",
  "end_date": "2025-07-20",
  "trigger_timings": ["14:22", "18:00"],
  "freq": "custom",
  "custom_days": [
    { "weekly": ["mon", "fri"] },
    "2025-06-25",
    "2025-06-29"
  ],
  "callback_url": "https://example.com/myhook",
  "uid": "user_123",
  "metadata": {
    "type": "post_publish",
    "post_id": 912
  }
}
```

### 📘 Field Descriptions

- `start_date` (string): ISO date; required.
- `end_date` (string): ISO date; optional.
- `trigger_timings` (string[]): Array of HH:mm formatted times.
- `freq`: "daily" or "custom"
- `custom_days`: array of one of the following:
  - `{ "weekly": ["mon", "tue", ...] }`
  - `{ "monthly": [12] }` (12th of each month)
  - `{ "interval": 3 }` (every 3 days from start_date)
  - or just specific ISO date strings
- `callback_url`: string; the URL to call on match
- `uid`: string; user identifier
- `metadata`: JSON object passed through to callback on match

Constraints:

- If freq = "daily", custom_days may be empty.
- If freq = "custom", custom_days must contain exactly one of weekly, monthly, or interval — optionally mixed with specific date strings.

---

## 🧠 Cron Evaluation Logic

GitHub Action runs every minute. Each execution:

1. Gets current UTC date and time
2. Fetches all jobs where:
   - `status` = "active"
   - `start_date` <= today AND (end_date IS NULL OR today <= end_date)
   - current time (HH:mm) is in `trigger_timings`
3. For each job:
   - If freq = "daily" → trigger
   - Else if freq = "custom":
     - If today ∈ override dates → trigger
     - Else if rule type = weekly → today ∈ weekly days?
     - Else if rule = monthly → day-of-month match?
     - Else if rule = interval → is N days since start_date?
4. If triggered, POST to `callback_url` with:

```json
{
  "metadata": { ... },
  "job_id": "uuid",
  "triggered_at": "2025-06-21T14:22:00Z"
}
```

---

## 🗄️ Supabase Schema (jobs table)

| Column           | Type      | Description                             |
| ---------------- | --------- | --------------------------------------- |
| id               | UUID      | Primary key                             |
| uid              | TEXT      | User identifier                         |
| start_date      | DATE      | When the job becomes active             |
| end_date        | DATE      | Optional expiration date                |
| trigger_timings | TEXT[]    | Array of time-of-day strings            |
| freq             | TEXT      | "daily" or "custom"                     |
| rule_type       | TEXT      | "weekly", "monthly", "interval" or null |
| rule_value      | JSONB     | Depends on rule_type                   |
| override_dates  | DATE[]    | Optional list of specific trigger dates |
| callback_url    | TEXT      | Destination for webhook trigger         |
| metadata         | JSONB     | Custom payload to forward               |
| status           | TEXT      | "active", "paused"                      |
| last_triggered  | TIMESTAMP | Optional, for logging/tracking          |
| created_at      | TIMESTAMP | Default now()                           |

---

## 🔑 API Authentication & Job Ownership

To support secure multi-user access and job control:

- Every user receives a unique API key.
- API key is required for all authenticated routes (create, delete, pause, update, list).
- On job creation, the authenticated user's uid is stored in the `uid` field of the job.
- For any action (delete, update, get):
  - The incoming API key is validated.
  - The job is fetched by `id`.
  - We check if `job.uid === requester.uid`. Only then is the action allowed.

API key usage prevents unauthorized access to other users’ jobs.

---

## 🛠️ Job Management API (Planned)

- POST /api/schedule → create new job
- GET /api/job/:id → fetch job (auth required)
- PATCH /api/job/:id → update status or fields (auth required)
- DELETE /api/job/:id → delete job (auth required)
- GET /api/jobs → list user’s jobs (auth required)

---

## 💡 Implementation Guidelines

- All sensitive secrets (e.g., Supabase keys) are stored as GitHub Action Secrets and not in the public repo.
- Use dayjs or date-fns in the runner script for time logic.
- Keep the GitHub Action runner efficient: batch fetch jobs, process quickly, handle failures.
- Jobs that fail can be retried or marked as failed in a future version.

---

## 🌐 Architecture Overview

Frontend/API (Next.js on Vercel):

- Accepts job scheduling payloads via POST
- Optional dashboard & auth (post-MVP)

Database (Supabase):

- Stores all job definitions
- Enforces RLS for multi-tenant support (future)

Runner (GitHub Action):

- Runs every minute
- Triggers due callbacks
- Handles result logging (minimal for now)

---

## 💰 Monetization

- Open source project (MIT or Elastic license)
- Hosted version can offer:
  - Free plan (e.g., 100 jobs/month)
  - Paid plans via API keys + usage tiers
  - (Both will be provided with API keys for better handling)

---

This document serves as the definitive specification to be used with Cursor AI or other tools to build and maintain the project incrementally.

