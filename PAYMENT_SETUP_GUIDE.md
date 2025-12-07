# 💳 Payment Integration Setup Guide

Complete guide to set up Paymob and Stripe payment processing for your QR Restaurant Ordering System.

## 📋 Overview

Your app now supports **three payment modes**:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Mock** 🧪 | Demo payments (no real money) | Testing & Demos |
| **Paymob** 🇪🇬 | Egyptian payment gateway | Egyptian customers |
| **Stripe** 🌍 | International payment gateway | International customers |

---

## 🚀 Quick Start (Demo Mode)

**Current Status**: Your app is ready to demo with **mock payments** (no setup needed)!

✅ Test it now:
1. Visit: http://localhost:3000/table/12
2. Add items to cart → Checkout
3. Payment page → Select "Demo Payment (Testing)"
4. Click Pay → Success! (90% success rate for realism)

---

## 🇪🇬 Paymob Setup (Egyptian Payments)

### Step 1: Create Account

1. Go to: https://accept.paymob.com/portal2/en/register
2. Fill in business details:
   - Business name
   - Email & Phone
   - Business type: Restaurant/Food & Beverage
3. Verify email and phone
4. Complete KYC (upload documents):
   - National ID
   - Commercial registration (if applicable)

### Step 2: Get API Credentials

1. Login: https://accept.paymob.com/portal2/en/login
2. Go to **Settings** → **Account Info** → **API Keys**
3. Copy the following:
   - **API Key** (long string starting with `ZXlK...`)
   - **Integration ID** (found in Settings → Payment Integrations)
   - **HMAC Secret** (for webhook verification)
   - **IFrame ID** (found in Settings → Payment Integrations)

### Step 3: Enable Test Mode

1. In Paymob Dashboard, toggle **Test Mode** to ON
2. This allows testing without real money

### Step 4: Add to Environment Variables

Edit `qrcode/.env` and uncomment/fill these lines:

```bash
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...
PAYMOB_INTEGRATION_ID=1234567
PAYMOB_HMAC_SECRET=your_hmac_secret
PAYMOB_BASE_URL=https://accept.paymob.com/api
PAYMOB_IFRAME_URL=https://accept.paymob.com/api/acceptance/iframes
```

### Test Cards (Paymob)

```
✅ Success:
Card: 4987654321098769
Expiry: 05/25
CVV: 123

❌ Declined:
Card: 4000000000000002
```

---

## 🌍 Stripe Setup (International Payments)

### Step 1: Create Account

1. Go to: https://stripe.com
2. Click "Start now" (free)
3. Fill in details:
   - Email & Password
   - Country: Egypt (or your country)
4. Verify email

### Step 2: Get Test API Keys

1. Login: https://dashboard.stripe.com
2. You're automatically in **TEST mode** (see toggle at top)
3. Click **Developers** in left sidebar
4. Click **API Keys**
5. Copy:
   - **Publishable key**: `pk_test_51...`
   - **Secret key**: `sk_test_51...` (click "Reveal test key")

### Step 3: Add to Environment Variables

Edit `qrcode/.env` and uncomment/fill these lines:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
```

### Test Cards (Stripe)

```
✅ Success:
Card: 4242 4242 4242 4242
Expiry: Any future date (12/25)
CVV: Any 3 digits (123)
ZIP: Any 5 digits (12345)

❌ Declined:
Card: 4000 0000 0000 0002

⚠️ Requires 3D Secure:
Card: 4000 0025 0000 3155

💰 Insufficient Funds:
Card: 4000 0000 0000 9995
```

---

## 🧪 Testing Your Setup

### 1. Start Development Server

```bash
cd qrcode
npm run dev
```

### 2. Test Each Payment Mode

#### Test Mock Payment (Already Working)
1. Visit: http://localhost:3000/table/12
2. Add items → Checkout
3. Select "Demo Payment (Testing)"
4. Pay → Should succeed

#### Test Paymob (After Setup)
1. Visit: http://localhost:3000/table/12
2. Add items → Checkout
3. Select "Paymob (Egypt)"
4. Use test card: 4987654321098769
5. Pay → Should redirect to Paymob iframe

#### Test Stripe (After Setup)
1. Visit: http://localhost:3000/table/12
2. Add items → Checkout
3. Select "Stripe (International)"
4. Use test card: 4242 4242 4242 4242
5. Pay → Should succeed

---

## 🚀 Deployment (Vercel)

### Add Environment Variables to Vercel

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add the same variables from your `.env` file:

```
DATABASE_URL=...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=...

# If using Paymob:
PAYMOB_API_KEY=...
PAYMOB_INTEGRATION_ID=...
PAYMOB_HMAC_SECRET=...
PAYMOB_BASE_URL=https://accept.paymob.com/api
PAYMOB_IFRAME_URL=https://accept.paymob.com/api/acceptance/iframes

# If using Stripe:
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

4. Redeploy your app

---

## 🔄 Switching to Live Mode

### When Ready for Real Payments:

### Paymob:
1. Complete full KYC verification
2. Get approved by Paymob
3. Turn OFF "Test Mode" in dashboard
4. Replace test credentials with live credentials
5. Update environment variables

### Stripe:
1. Go to Stripe Dashboard
2. Toggle from "Test mode" to "Live mode"
3. Get live API keys from Developers → API Keys
4. Replace test keys with live keys:
   - `pk_live_...` (publishable)
   - `sk_live_...` (secret)
5. Update environment variables

---

## 💰 Pricing Comparison

### Paymob (Egypt)
- **Setup**: Free
- **Transaction Fee**: ~2.5% + EGP 1.00 per transaction
- **Best for**: Egyptian customers, local cards

### Stripe (International)
- **Setup**: Free
- **Transaction Fee**: 2.9% + $0.30 per transaction
- **Best for**: International cards, tourists

---

## 🎯 Recommended Strategy

**For Egyptian Restaurant:**

1. **Start with Mock** mode for demos (FREE)
2. **Add Paymob** for local customers (lower fees)
3. **Add Stripe** optionally for international customers
4. **Let customers choose** which payment method to use

This gives you maximum flexibility!

---

## 🆘 Troubleshooting

### Mock payments not working
✅ No setup needed - should work out of the box
- Check: Payment page loads?
- Check: Email field filled?

### Paymob errors
❌ "Tenant or user not found"
- Check: API Key is correct?
- Check: Test mode is ON?
- Check: Credentials are uncommented in `.env`?

### Stripe errors
❌ "Stripe is not configured"
- Check: Both publishable and secret keys added?
- Check: Keys start with `pk_test_` and `sk_test_`?
- Check: Environment variables loaded? (restart server)

---

## 📞 Support

### Paymob Support
- Email: support@paymob.com
- Phone: +20 2 25291300
- Docs: https://docs.paymob.com

### Stripe Support
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Email: support@stripe.com

---

## ✅ Checklist

- [ ] Mock payments working (demo mode)
- [ ] Paymob account created (if using)
- [ ] Paymob credentials added to `.env`
- [ ] Tested Paymob with test card
- [ ] Stripe account created (if using)
- [ ] Stripe test keys added to `.env`
- [ ] Tested Stripe with test card
- [ ] Environment variables added to Vercel
- [ ] Tested on production deployment

---

**Ready to accept payments!** 🎉

For questions or issues, refer to this guide or check the official documentation for each payment provider.
