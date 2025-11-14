# Fresh Groceries - E-Commerce Grocery Store

A modern full-stack e-commerce grocery website built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- ✅ **Product Catalog** - Browse products by category with search functionality
- ✅ **Shopping Cart** - Add, update, and remove items from cart
- ✅ **Product Details** - Detailed product pages with quantity selection
- ✅ **Checkout** - Complete checkout process with order summary
- ✅ **Next.js 16** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for modern, responsive styling
- ✅ **RESTful API routes** for products and cart management
- ✅ **Client-side state management**
- ✅ **Server-side rendering**

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Project Structure

```
grocery/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   ├── store.ts          # Product data store
│   │   │   ├── route.ts           # GET /api/products
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET /api/products/[id]
│   │   └── cart/
│   │       └── route.ts          # Cart CRUD operations
│   ├── components/
│   │   ├── Cart.tsx              # Shopping cart component
│   │   └── ProductCard.tsx       # Product card component
│   ├── products/
│   │   └── [id]/
│   │       └── page.tsx          # Product detail page
│   ├── checkout/
│   │   └── page.tsx              # Checkout page
│   ├── about/
│   │   └── page.tsx              # About page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/Shop page
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Endpoints

### Products
- `GET /api/products` - Get all products (optional query: `?category=...&search=...`)
- `GET /api/products/[id]` - Get a single product

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart` - Update item quantity
- `DELETE /api/cart` - Remove item or clear cart

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Product Categories

- Fruits & Vegetables
- Dairy & Eggs
- Meat & Seafood
- Bakery
- Beverages
- Snacks
- Frozen Foods
- Pantry Staples

## Next Steps

To make this production-ready, consider:

1. **Database Integration**: Replace in-memory storage with a database (PostgreSQL, MongoDB, Prisma, etc.)
2. **Payment Processing**: Integrate Stripe, PayPal, or other payment gateways
3. **Authentication**: Add user authentication (NextAuth.js, Clerk, etc.)
4. **Order Management**: Create order history and tracking system
5. **Image Upload**: Replace emoji placeholders with actual product images
6. **Inventory Management**: Add stock tracking and management
7. **Reviews & Ratings**: Implement user reviews and ratings system
8. **Email Notifications**: Send order confirmations via email
9. **Environment Variables**: Use `.env.local` for configuration
10. **Testing**: Add unit and integration tests
11. **Deployment**: Deploy to Vercel, Netlify, or your preferred platform

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

