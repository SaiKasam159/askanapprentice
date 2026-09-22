# ApprentaCall — UX/functional bug list (retest)

Retested https://apprentacall.vercel.app/ as both a prospective student and a prospective mentor. The app has clearly moved on since the last pass — password fields now exist on both signup forms, the mentor directory has real "Book" buttons, dead nav links are mostly fixed, and "Log out" now works. Good progress. Here's what's still broken.

## Critical — nobody can currently create an account

1. **Signup (and login) fails app-wide with a raw server error: "NEXTAUTH_SECRET is not set; sessions cannot be signed."** Reproduced on both the student signup form (`/signup`) and the mentor signup form (`/apprentice/signup`) — filling in every field correctly and submitting always ends in this error, and the account is never actually created (confirmed by then trying to log in with those exact credentials, which fails with "An error occurred during login"). This is a missing `NEXTAUTH_SECRET` environment variable in the deployment, not a code bug, but it currently blocks 100% of signups and logins — nobody can use the product at all right now. This should be the very first thing fixed, and error states like this should never surface raw env/config strings to end users regardless — that needs a generic "something went wrong, please try again" fallback even once the env var is set correctly.

## High

2. **The mentor directory's "View profile" button doesn't go to a profile — it goes to the homepage.** Clicking "View profile" on a mentor card (e.g. Sai Krishang Kasam's) lands on the landing page hero, not any kind of mentor detail page. There doesn't appear to be a mentor profile page at all yet.

3. **The "See pricing" flow is disconnected from the real booking flow and mislabels its own numbers.** From the homepage, "See pricing" leads to a generic "Choose your call" page with no mentor attached. With "This is my first call" ticked, it shows Deep Dive (30 min) as "Free" but the order summary still shows a **"First call offer −£10.00"** line, as if a £10 charge was first applied then discounted — confusing, since the card itself already says "Free," not "£10, waived." Untick the first-call box and the summary is worse: it labels the £10 session price itself as **"Platform fee: £10.00"**, with no separate line for what the mentor is actually charging. And clicking "Continue to payment" doesn't go to any kind of checkout — it silently redirects to the Browse Mentors page. This whole page reads like a disconnected demo/mock rather than the real checkout, which is reached separately (and correctly) via each mentor's own "Book 30 min / 45 min" buttons.

4. **Dashboard nav item doesn't navigate.** While the app briefly still had an old logged-in session cached, the top nav showed "Browse mentors / Dashboard / Log out." Clicking "Dashboard" highlighted the tab as active but left the landing-page hero content on screen — no navigation happened.

5. **Stale "apprentice profile not found" error page has no styling or recovery path.** Clicking "Browse mentors" from that same stale session state landed on a bare, unstyled page reading only "Apprentice profile not found," with both "Browse mentors" and "Dashboard" nav items shown highlighted simultaneously. No back link, no "browse mentors instead" CTA, just plain text on an otherwise empty page.

## Medium

6. **Client-side navigation to `/login` doesn't repaint until a hard reload.** Clicking "Log in" in the top nav updates the browser URL to `/login` (confirmed via `window.location.href`), but the visible page keeps showing the previous screen's content (in this case, a signup form with an error banner still on it) until you force a reload. This looks like a router/state desync rather than a broken link — worth checking wherever `router.push`/`Link` is used for this transition.

7. **Password-reset email validation rejects the reserved `@example.com` test domain with a misleading message.** Submitting `teststudent2@example.com` on "Reset password" returns "Email address 'teststudent2@example.com' is invalid" — but that's a syntactically valid address (and `example.com` is the IANA-reserved domain literally meant for this kind of testing). If the intent is to block disposable/placeholder domains, the copy should say that rather than "is invalid," which reads as a format error. The same error is also shown twice at once — once inline under the field and once as a toast in the bottom-right corner — which is redundant.

8. **"Reset password" page copy promises a step the page doesn't have.** The subtitle reads "Enter your email or choose a new password," but the page only ever shows an email field — there's no way to choose a new password from this screen (presumably that happens after clicking the emailed link, but the copy implies it's an either/or choice available here).

## Fixed since last pass (confirmed working now, noted for completeness)

- Both signup forms now have a password field with an "At least 8 characters" hint.
- Sector checkboxes on the student signup form now have proper spacing between the box and label.
- LinkedIn URL is genuinely optional on the mentor signup form now — submitting without it no longer blocks the form.
- Mentor signup now asks for an email address.
- The mentor directory has real, clearly-labelled "Book 30 min • Free" / "Book 45 min • £10" buttons instead of ambiguous price badges, and booking correctly gates on having a student account ("Sign in to book").
- "Log out" now actually logs out and returns the nav to its logged-out state.

## Not yet retestable

Because signup/login are fully broken by bug #1, the actual mentor dashboard, student dashboard, and post-login booking confirmation screens couldn't be reached or tested this pass. Worth another full pass once the auth issue is fixed.
