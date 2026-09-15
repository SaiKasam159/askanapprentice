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
- [x] Build /signup page (email, age verification, sector/company selection)
- [x] Build /confirm-email page and email resend flow
- [x] Implement email confirmation token generation & verification (/verify-email)
- [x] Set up Resend email sending (confirmation & transactional emails)
- [x] Build /directory page (filter by sector, show apprentice cards with Calendly links)
- [x] Implement guardian consent flow (/guardian-consent for under-16s)
- [x] Build post-call confirmation form (/confirm-call)
- [x] Build post-call rating form (/rate-call with 5-star + comment)
- [ ] Add email fallback form (fallback when Calendly fails)

## Apprentice Flows
- **Priority:** P1
- [x] Build /apprentice/signup page (bio, sector/company, Calendly link)
- [x] Build /apprentice/dashboard (view profile, see ratings, manual verification pending)
- [x] Create signup success page with approval workflow info
- [ ] Set up founder approval/verification system for apprentice profiles
- [ ] Create call confirmation email flow
- [ ] Create rating notification flow
- [ ] Integrate LinkedIn OAuth (future enhancement)

## Features
- **Priority:** P2
- [ ] Implement directory pagination (10 per page, lazy-load)
- [x] Add rating display (5-star + average on apprentice cards & dashboard)
- [x] Add rating aggregation (recalculates average_rating on each new submission)
- [x] Add mutual confirmation logic (both parties confirm before ratings visible)
- [x] Implement anonymized comments (students don't see who left feedback)
- [ ] Add email reminders (24h before scheduled calls)

## Parental Consent (GDPR)
- **Priority:** P0 (blocking)
- [x] Add age-check logic in signup
- [x] Add guardian email consent workflow for under-16s
- [x] Store consent audit trail (consent tokens + consent dates)
- [ ] Legal review of privacy policy & consent form (CRITICAL BLOCKER)

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
