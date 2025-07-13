# QR Restaurant Ordering System

A complete contactless restaurant ordering system built with Next.js and designed for Vercel deployment. Customers scan QR codes to view menus, place orders, and pay directly from their phones.

## Features

### Customer Experience
- 📱 **QR Code Scanning**: Customers scan table QR codes to access menu
- 🍽️ **Digital Menu**: Browse categorized menu items with images and descriptions
- 🛒 **Shopping Cart**: Add items, adjust quantities, and review orders
- 💳 **Secure Payment**: Pay with credit/debit cards or Apple Pay
- 📧 **Digital Receipts**: Automatic email receipts and order confirmation

### Restaurant Management
- 👨‍💼 **Admin Dashboard**: Monitor all orders in real-time
- 📊 **Order Status Tracking**: Track orders from pending to completion
- 🏷️ **QR Code Generator**: Generate and print QR codes for tables
- 📈 **Sales Analytics**: View revenue and order statistics
- ⚡ **Real-time Updates**: Live order status updates

### Technical Features
- 🚀 **Next.js 14**: Built with the latest Next.js features
- 🎨 **Tailwind CSS**: Modern, responsive design
- 📱 **Mobile-First**: Optimized for mobile devices
- 🔒 **Secure**: Payment processing and data protection
- ☁️ **Vercel Ready**: Optimized for Vercel deployment

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd qr-restaurant-ordering
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
```

Optional (for full functionality):
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your restaurant ordering system!

## Deployment to Vercel

### 1. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### 2. Configure Environment Variables
In your Vercel dashboard, add the environment variables from your `.env.local` file.

### 3. Update URLs
Update `NEXTAUTH_URL` to your Vercel domain:
```
NEXTAUTH_URL=https://your-app.vercel.app
```

## Usage Guide

### For Restaurant Owners

1. **Generate QR Codes**
   - Visit `/qr-generator`
   - Generate codes for individual tables or bulk generate
   - Print and place QR codes on tables

2. **Manage Orders**
   - Visit `/admin` to view all orders
   - Update order status as you prepare food
   - Track revenue and analytics

3. **Customize Menu**
   - Edit `data/menu.ts` to update your menu items
   - Add your own images and pricing
   - Redeploy to update the live menu

### For Customers

1. **Scan QR Code** on restaurant table
2. **Browse Menu** by category
3. **Add Items** to cart with quantities
4. **Review Order** and proceed to checkout
5. **Enter Email** for receipt
6. **Pay Securely** with card or Apple Pay
7. **Receive Receipt** via email and on screen

## Customization

### Menu Items
Edit `data/menu.ts`:
```typescript
export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Your Dish Name',
    description: 'Delicious description',
    price: 1500.00, // Price in your currency
    category: 'Main Course',
    image: 'https://your-image-url.com/image.jpg',
    available: true
  },
  // Add more items...
];
```

### Restaurant Information
Update restaurant details in `data/menu.ts`:
```typescript
export const restaurant = {
  name: 'Your Restaurant Name',
  address: 'Your Address',
  phone: 'Your Phone',
  email: 'your@email.com',
  taxRate: 0.14, // 14% tax
  serviceChargeRate: 0.12 // 12% service charge
};
```

### Styling
The app uses Tailwind CSS. Customize colors and styling in:
- `tailwind.config.js` - Theme configuration
- `app/globals.css` - Global styles
- Component files - Individual component styling

## Payment Integration

### Stripe Setup (Recommended)
1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Add keys to environment variables
4. The app includes Stripe integration ready to use

### Other Payment Providers
The payment API (`app/api/payment/route.ts`) can be modified to work with:
- PayPal
- Square
- Local payment providers

## Database Integration

Currently uses in-memory storage for demo purposes. For production:

### PostgreSQL (Recommended)
```bash
npm install @vercel/postgres
```

### MongoDB
```bash
npm install mongodb
```

### Supabase
```bash
npm install @supabase/supabase-js
```

Update the API routes in `app/api/` to use your chosen database.

## Email Configuration

For receipt emails, configure your email provider:

### Gmail
1. Enable 2-factor authentication
2. Generate an app password
3. Use your Gmail and app password in environment variables

### Other Providers
Update the nodemailer configuration in `app/api/payment/route.ts`

## Security Considerations

- Environment variables are used for sensitive data
- Payment processing is handled securely
- Input validation on all forms
- HTTPS required for production (automatic with Vercel)

## Support

For issues and questions:
1. Check the GitHub issues
2. Review the documentation
3. Contact support

## License

MIT License - feel free to use this project for your restaurant or modify it for your needs.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **QR Codes**: qrcode library
- **Email**: Nodemailer
- **Deployment**: Vercel
- **Payments**: Stripe (configurable)

## Project Structure

```
qr-restaurant-ordering/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── orders/              # Order management endpoints
│   │   └── payment/             # Payment processing
│   ├── admin/                   # Admin dashboard
│   ├── checkout/[tableNumber]/  # Checkout page
│   ├── receipt/[orderId]/       # Receipt display
│   ├── table/[tableNumber]/     # Customer menu view
│   ├── qr-generator/            # QR code generation
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── CartSummary.tsx          # Shopping cart sidebar
│   └── MenuSection.tsx          # Menu display component
├── context/                      # React context
│   └── OrderContext.tsx         # Order state management
├── data/                         # Static data
│   └── menu.ts                  # Menu items and restaurant info
├── types/                        # TypeScript definitions
│   └── index.ts                 # Type definitions
├── .env.example                 # Environment variables template
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
└── README.md                    # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] Multi-language support
- [ ] Kitchen display system
- [ ] Inventory management
- [ ] Customer loyalty program
- [ ] Advanced analytics
- [ ] Table reservation system
- [ ] Staff management
- [ ] Multi-restaurant support

## Performance Tips

- Images are optimized with Next.js Image component
- Components are lazy-loaded where appropriate
- API routes are optimized for Vercel Edge Functions
- Tailwind CSS is purged for production builds

## Troubleshooting

### Common Issues

**QR codes not generating:**
- Check if qrcode package is installed
- Verify NEXTAUTH_URL is set correctly

**Payment not working:**
- Ensure Stripe keys are configured
- Check console for payment errors
- Verify HTTPS in production

**Emails not sending:**
- Check email provider configuration
- Verify EMAIL_USER and EMAIL_PASS
- Check firewall/security settings

**Orders not appearing in admin:**
- Check API routes are working
- Verify order creation in browser network tab
- Clear browser cache

### Getting Help

1. Check browser console for errors
2. Review Vercel deployment logs
3. Test API endpoints directly
4. Verify environment variables are set

---

Built with ❤️ for restaurants worldwide. Transform your dining experience with contactless ordering!