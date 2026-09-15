# TODOS

## Database & Backend
- **Priority:** P0
- [ ] Set up Supabase project and connect to app
- [ ] Create database schema (apprentices, students, ratings, call_confirmations tables)
- [ ] Set up Supabase auth (email + OAuth)
- [ ] Create API routes for database operations

## Authentication
- **Priority:** P0
- [ ] Implement student email signup & confirmation
- [ ] Implement apprentice LinkedIn OAuth login
- [ ] Create auth middleware
- [ ] Add session management

## Student Flows
- **Priority:** P1
- [ ] Build /signup page (email, age verification, sector/company selection)
- [ ] Build /directory page (filter by sector/company, show apprentice cards with Calendly links)
- [ ] Add email fallback form (fallback when Calendly fails)
- [ ] Build post-call confirmation form
- [ ] Build post-call rating form (5-star + comment)

## Apprentice Flows
- **Priority:** P1
- [ ] Build /apprentice/signup page (LinkedIn OAuth, bio, sector/company)
- [ ] Build /apprentice/dashboard (view profile, see ratings/comments, manage availability)
- [ ] Create call confirmation email flow
- [ ] Create rating notification flow

## Features
- **Priority:** P2
- [ ] Implement directory pagination (10 per page, lazy-load)
- [ ] Add rating aggregation & display
- [ ] Add mutual confirmation logic (both parties confirm)
- [ ] Implement anonymized comments visible to apprentices

## Parental Consent (GDPR)
- **Priority:** P0 (blocking)
- [ ] Legal review of privacy policy & consent form
- [ ] Add age-check logic in signup
- [ ] Add guardian email consent workflow for under-16s
- [ ] Store consent audit trail

## Testing & Deployment
- **Priority:** P3
- [ ] Add E2E tests for happy path (signup → directory → book call → rate)
- [ ] Add error scenario tests (Calendly failure, email send failure)
- [ ] Set up deployment pipeline (Vercel)
- [ ] Configure environment variables

## Phase 1.5 Features (Post-MVP)
- **Priority:** P4
- [ ] Implement reminder emails (24h before call) via Vercel Cron
- [ ] Build admin dashboard for founder (see ratings, manage apprentices)
- [ ] Add analytics (show-up rates, satisfaction trends)

## Phase 2 Features (After Pricing Research)
- **Priority:** P5
- [ ] Implement CV review booking (paid add-on)
- [ ] Implement mock interview prep (paid add-on)
- [ ] Add Stripe payment integration
- [ ] Replace Calendly with platform-native scheduling
- [ ] Add video call hosting (Zoom integration)
