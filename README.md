# Ask An Apprentice

Connect aspiring apprentices with current degree apprentices for sector-specific guidance and advice.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Then fill in `.env.local` with your actual credentials:

**Supabase Setup:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your Project URL and Anon Key to `.env.local`
4. Get your Service Role Key from Settings → API

**LinkedIn OAuth (for apprentices):**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create an OAuth 2.0 app
3. Set redirect URI to `http://localhost:3000/api/auth/callback/linkedin`
4. Copy Client ID and Secret to `.env.local`

**Email (Resend):**
1. Sign up at [resend.com](https://resend.com)
2. Get your API key and add to `.env.local`

**NextAuth Secret:**
```bash
openssl rand -base64 32
```
Copy the output to `NEXTAUTH_SECRET` in `.env.local`

### 3. Set Up Database Schema
Create these tables in Supabase:

**apprentices table:**
```sql
CREATE TABLE apprentices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  linkedin_id TEXT UNIQUE,
  sector TEXT NOT NULL,
  company TEXT NOT NULL,
  bio TEXT,
  linkedin_url TEXT,
  calendly_link TEXT NOT NULL,
  average_rating FLOAT DEFAULT 0,
  response_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**students table:**
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  age_verified BOOLEAN DEFAULT FALSE,
  target_sector TEXT,
  target_company TEXT,
  guardian_email TEXT,
  guardian_consent BOOLEAN DEFAULT FALSE,
  guardian_consent_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**ratings table:**
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apprentice_id UUID REFERENCES apprentices(id),
  student_id UUID REFERENCES students(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**call_confirmations table:**
```sql
CREATE TABLE call_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apprentice_id UUID REFERENCES apprentices(id),
  student_id UUID REFERENCES students(id),
  apprentice_confirmed BOOLEAN DEFAULT FALSE,
  student_confirmed BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Run the Dev Server
```bash
npm run dev
```

Visit `http://localhost:3000` and you're ready to build!

## Project Structure

- `/app` — Next.js App Router pages and layouts
- `/components` — React components
- `/lib` — Utilities and Supabase client setup
- `/public` — Static assets

## Next Steps

1. Build student signup page (`/app/signup`)
2. Build apprentice signup page (`/app/apprentice/signup`)
3. Build directory page (`/app/directory`)
4. Set up API routes for database operations
5. Add authentication flows

See `TODOS.md` for the full checklist.

## Legal

⚠️ **Important:** Before launching, complete the legal review for GDPR/parental consent (UK students under 16). See design doc for details.

## Deployment

Deploy to Vercel:
```bash
npm run build
```

Then push to GitHub and connect your repo to Vercel for automatic deployments.
