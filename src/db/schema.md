# Database Schema Documentation

## Users Table

The `users` table stores information about authenticated users and their API keys.

| Column     | Type                     | Description                               |
|------------|--------------------------|-------------------------------------------|
| id         | UUID                     | Primary key, auto-generated              |
| email      | TEXT                     | Unique email address from OAuth          |
| name       | TEXT                     | User's display name                      |
| image_url  | TEXT                     | Profile picture URL                      |
| api_key    | UUID                     | Optional API key, null by default        |
| created_at | TIMESTAMP WITH TIME ZONE | Record creation timestamp (UTC)          |
| updated_at | TIMESTAMP WITH TIME ZONE | Record last update timestamp (UTC)       |

### Row Level Security (RLS)
The table has RLS enabled with the following policies:
1. "Enable insert for service role" - Allows new user creation
2. "Enable update for service role" - Allows updating existing users

These policies ensure that:
- Only our service role can create/update users
- API keys remain secure and only accessible through proper channels
- No unauthorized modifications to user data

### Indexes
- Primary Key on `id`
- Unique constraint on `email`

### Description
This table stores user information obtained during OAuth authentication. Users start with no API key (null). They can generate an API key when needed through a secure endpoint. This ensures API keys are only created when explicitly requested by the user.

### Security Notes
- API keys are null by default and only generated upon user request
- API keys should only be used server-side for job management
- Frontend never receives or handles API keys
- All API endpoints must validate API keys server-side
- Row Level Security (RLS) ensures data can only be modified through our service role

---

Note: This schema documentation will be updated as we add more tables and functionality to the system. 