# 🍽️ QR Restaurant Ordering System

A complete contactless restaurant ordering system built with Next.js. Customers scan QR codes to view menus, place orders, add tips, and pay directly from their phones.

## ✨ Features

### 👥 Customer Experience
- 📱 **QR Code Scanning** - Scan table QR codes to access menu
- 🍽️ **Digital Menu** - Browse categorized menu items with images
- 🛒 **Shopping Cart** - Add items, adjust quantities, review orders
- 💰 **Flexible Tipping** - Choose from 5%, 10%, 20% or custom tip amounts
- 💳 **Secure Payment** - Pay with credit/debit cards or Apple Pay
- 📧 **Digital Receipts** - Automatic email receipts and confirmation

### 🏪 Restaurant Management
- 👨‍💼 **Admin Dashboard** - Monitor all orders in real-time
- 📊 **Order Tracking** - Track orders from pending to completion
- 🏷️ **QR Generator** - Generate and print QR codes for tables
- 📈 **Analytics** - View revenue and order statistics
- ⚡ **Live Updates** - Real-time order status updates

### 🛠️ Technical Features
- 🚀 **Next.js 14** - Built with App Router and TypeScript
- 🎨 **Tailwind CSS** - Modern, responsive design
- 📱 **Mobile-First** - Optimized for phone usage
- 🔒 **Secure** - Payment processing and data protection
- ☁️ **Vercel Ready** - Optimized for deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/qr-restaurant-ordering.git
   cd qr-restaurant-ordering
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret
   
   # Optional for full functionality
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit `http://localhost:3000`

## 📱 Demo

### Customer Flow
1. Visit `http://localhost:3000/table/12` (or scan generated QR code)
2. Browse menu and add items to cart
3. Proceed to checkout
4. Add tip (optional)
5. Enter email and pay
6. Receive digital receipt

### Restaurant Management
1. Visit `http://localhost:3000/admin` to view orders
2. Update order status as you prepare food
3. Generate QR codes at `http://localhost:3000/qr-generator`

## 🏗️ Project Structure

```
qr-restaurant-ordering/
├── app/                     # Next.js app directory
│   ├── api/                 # API routes
│   ├── admin/               # Admin dashboard
│   ├── checkout/            # Checkout with tips
│   ├── qr-generator/        # QR code generation
│   ├── receipt/             # Digital receipts
│   └── table/               # Customer menu
├── components/              # Reusable components
├── context/                 # React context (cart state)
├── data/                    # Menu items and config
└── types/                   # TypeScript definitions
```

## 🎨 Customization

### Menu Items
Edit `data/menu.ts` to customize your menu:

```typescript
export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Your Dish',
    description: 'Delicious description',
    price: 2500.00,
    category: 'Main Course',
    image: 'https://your-image-url.com',
    available: true
  }
];
```

### Restaurant Settings
Update restaurant information in `data/menu.ts`:

```typescript
export const restaurant = {
  name: 'Your Restaurant Name',
  taxRate: 0.14,        // 14% tax
  serviceChargeRate: 0.12 // 12% service charge
};
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Update NEXTAUTH_URL** to your Vercel domain

### Other Platforms
- **Netlify**: Connect GitHub repo and deploy
- **Railway**: `railway login && railway deploy`
- **Heroku**: Add buildpack and deploy

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your app's URL | ✅ |
| `NEXTAUTH_SECRET` | Random secret key | ✅ |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | ⚪ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ⚪ |
| `EMAIL_USER` | Email for receipts | ⚪ |
| `EMAIL_PASS` | Email password | ⚪ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

If you find this project helpful, please give it a ⭐️ on GitHub!

## 📞 Contact

- Create an [Issue](https://github.com/YOUR_USERNAME/qr-restaurant-ordering/issues) for bug reports
- [Discussions](https://github.com/YOUR_USERNAME/qr-restaurant-ordering/discussions) for questions

---

Built with ❤️ for restaurants worldwide. Transform your dining experience with contactless ordering!