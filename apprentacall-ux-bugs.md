# ApprentaCall — UX/functional bug list

Tested at https://apprentacall.vercel.app/ as both a prospective student (booking flow) and a prospective mentor (apprentice signup flow). No accounts existed beforehand, so everything below was found by signing up fresh both ways.

## Critical — breaks the core flow

1. **Signup never collects a password, but login requires one.** Both `/signup` (student) and `/apprentice/signup` (mentor) only ask for name/email/etc — there's no password field anywhere in either form. The "Log back in" screen (reached via "Log in to your account" / "Already have an account? Log in") asks for email **and** password. Since no password was ever set, logging back in with the signup email always fails with "Invalid email or password". Right now nobody who signs up can ever log back in. Either add a password field to both signup forms, switch to a magic-link/passwordless login that matches what's collected, or remove the password field from login.

2. **Nav bar "Home" and "Mentors" are swapped / desynced from their labels.** Clicking "Mentors" in the top nav does nothing — the content on screen doesn't change, but the "Mentors" tab still gets highlighted as active. Clicking "Home" afterwards is what actually navigates to the Browse Mentors directory. This reproduces from the landing page, the login page, and the mentor profile page. Looking at the DOM, the anchors have correct hrefs (`Home` → `/`, `Mentors` → `/directory`), but the click handlers intercept navigation and swap to custom state instead of using them — so the URL bar never changes either (stays on `/` throughout). Needs the click handlers fixed so each tab shows its own labeled page and the URL updates to match.

3. **"Log in to your account" button on the student "Account created!" screen does nothing.** After signup, the confirmation screen offers "Browse mentors" and "Log in to your account" — clicking the login button has no effect at all (no navigation, no error).

4. **"Log out" on the mentor profile page does nothing.** Same issue — dead button, no visible action, session state (whatever it is) doesn't change.

5. **"Browse mentors" button on the student "Account created!" screen navigates to the wrong place.** Instead of going to the mentor directory, it lands on the Log In page.

6. **Booking a call doesn't actually do anything.** The mentor directory copy says: *"Click 'Book call' to schedule a 30-minute free call or 45-minute call (£10)... You'll be redirected to the mentor's calendar."* There is no button labeled "Book call" anywhere — the only clickable-looking elements are the price/duration badges (e.g. "30 min • Free"). Clicking one doesn't redirect to Cal.com or show a confirmation; it just dumps you back on the landing page. This is the core conversion action of the whole product and it's non-functional.

## High — broken/contradictory validation

7. **Mentor signup form rejects the "optional" LinkedIn field.** The LinkedIn URL field is labelled with helper text "Helps mentors/students learn more about you (optional)" on both signup forms, but submitting without it fails with "All fields are required" (tested on the mentor form specifically — every other field was filled in and it still blocked submission until LinkedIn was added). Either make it genuinely optional or drop the "(optional)" copy.

8. **Validation error messages don't clear once the issue is fixed.** On the student signup form, "Select at least one sector" is visible even before the user has touched the form (i.e. it renders by default rather than only after a failed submit). On both the student and mentor forms, once you fix the flagged fields (check a sector, fill in the missing field) and the form is valid, the red error banner ("Please fill in all required fields" / "All fields are required") stays on screen instead of disappearing — it only goes away after a fresh, successful submit. This makes it look like the form is still broken even when it isn't.

## Medium

9. **Sector checkboxes have no spacing between the checkbox and its label** on the student signup form (`Sectors you're interested in`) — "Finance", "Law", etc. render with the checkbox glyph glued directly onto the text with zero gap, which looks broken and makes the hit target unclear. (The `45-minute calls` checkbox on the mentor form doesn't have this problem, so it looks like a one-off missing margin/gap style on that specific checkbox group.)

10. **Mentor signup has no confirmation screen.** Student signup shows a proper "Account created!" success screen with next-step buttons. Mentor signup just silently drops you onto "Your mentor profile" with no acknowledgement that the account was actually created — inconsistent with the student flow and easy to miss.

11. **Mentor signup never asks for an email address.** The form collects name, apprenticeship name, company, sector, LinkedIn, and Cal.com link, but no email — yet there's a "Log in" link on the same form implying mentors are expected to have login credentials later. There's no way to identify or contact a mentor account without one.

## Notes on scope

- No way to log in as an existing student or mentor exists today (per the above), so I could only test the two signup flows, not what a logged-in dashboard looks like for either role.
- The pending-verification behaviour for new mentors (hidden from the public directory until approved) worked correctly — flagging as a positive, not a bug.
