# ApprentaCall Deployment Guide

## What's New

This build includes:
- **ApprentaCall design system** with brass accent, navy surfaces, and Schibsted Grotesk/Source Serif typography
- **Pricing page** with three call options: free 15m intro, £10 30m deep dive, £15 45m extended
- **Stripe payment integration** for seamless checkout
- **Setup page** for configuring API keys
- **Payment intent API** that handles Stripe transactions

## Before Deploying

### 1. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" → "API Keys"
3. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Deploy to Vercel

```bash
# Login to Vercel (if you haven't already)
vercel login

# Deploy the project
vercel --prod
```

Or use the Vercel dashboard:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your repository
4. Deploy

### 3. Add Environment Variables to Vercel

After deploying:

1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add these two variables:
   - **STRIPE_PUBLISHABLE_KEY** = your publishable key
   - **STRIPE_SECRET_KEY** = your secret key

4. Redeploy with these environment variables

### 4. Test Payments

1. Go to your deployed app at `https://askanapprentice.vercel.app`
2. Click "Pricing"
3. Select a £10 or £15 call
4. Click "Continue to payment"
5. Use Stripe test card: **4242 4242 4242 4242**, any future expiry, any CVC

## Changing Domain to ApprentaCall

### Step 1: Change Vercel Domain

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your "Ask An Apprentice" project
3. Go to "Settings" → "Domains"
4. Click "Edit" on the current domain
5. Options:
   - **If you own apprentacall.com**: Add a custom domain, follow Vercel's DNS instructions
   - **If using Vercel's free domain**: Change the project name to "apprentacall" and redeploy

### Step 2: Update Your App URL

After changing the domain, update these files:

**`.env.local` (local development)**
```
NEXT_PUBLIC_APP_URL=https://apprentacall.vercel.app
```

**Vercel Environment Variables**
```
NEXT_PUBLIC_APP_URL=https://apprentacall.vercel.app
```

### Step 3: Update Stripe Webhook URLs (if applicable)

If you add webhooks later:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Update any webhook URLs to use your new domain

## Current Pricing Structure

```
Free intro:     15 min → £0
Deep dive:      30 min → £10
Extended:       45 min → £15

Platform split: 100% (100% to platform, 0% to apprentice for now)
```

To change this later, update `app/pricing/page.tsx` with mentor/platform split percentages.

## Local Development

```bash
# Add your test Stripe keys to .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Run locally
npm run dev

# Visit http://localhost:3000
```

## Pages

- **/** - Homepage with call types overview
- **/pricing** - Choose call length and price
- **/checkout** - Stripe payment form
- **/setup** - Configure API keys (mostly for info; set vars in Vercel)
- **/directory** - Mentor directory (existing page)

## API Endpoints

- **POST /api/create-payment-intent** - Creates Stripe payment intent
  - Body: `{ amount, duration, email }`
  - Returns: `{ clientSecret }`

- **POST /api/setup** - Configuration endpoint (informational)

## Next Steps

1. **Get Stripe keys** and add to Vercel
2. **Test payments** with test cards
3. **Change domain** in Vercel settings
4. **Update DNS** if using a custom domain
5. **Switch to live keys** when ready for real payments

## Questions?

- Stripe docs: https://stripe.com/docs
- Vercel docs: https://vercel.com/docs
- Design system: Check `public/apprentacall.css` for available classes
