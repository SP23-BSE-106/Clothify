# Clothify - E-Commerce Clothing Platform

Clothify is a modern, full-stack e-commerce application built with Next.js, designed for selling clothing and fashion items. The platform features a comprehensive admin dashboard for managing products, orders, and customers, alongside a customer-facing storefront with shopping cart, checkout, and order tracking capabilities.

## 🚀 Features

### Admin Dashboard
- **Authentication**: Secure admin login system with JWT tokens
- **Product Management**: Add, edit, update, and delete clothing products with images
- **Order Management**: View and manage customer orders with detailed item information
- **Customer Management**: Monitor and manage customer accounts
- **Dashboard Analytics**: Overview of orders, products, and customer data

### Customer Storefront
- **Product Catalog**: Browse clothing items with detailed product pages
- **Shopping Cart**: Add/remove items, update quantities
- **Secure Checkout**: Complete purchase flow with order confirmation
- **Order Tracking**: View order history and status
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

### Technical Features
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with bcrypt password hashing
- **API**: RESTful API routes for all operations
- **Styling**: Tailwind CSS for modern, responsive UI
- **State Management**: React hooks for cart and authentication

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Authentication**: JSON Web Tokens (JWT)
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- npm, yarn, or pnpm package manager

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SP23-BSE-106/Clothify.git
   cd Clothify
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   - Create a `.env.local` file in the root directory
   - Add the required environment variables (see ENVIRONMENT_SETUP.md for details):
     ```
     MONGODB_URI=mongodb://127.0.0.1:27017/clothify
     JWT_SECRET=your-secret-key-change-in-production
     ```

4. **Start MongoDB**
   - Ensure MongoDB is running locally on port 27017, or update MONGODB_URI for cloud MongoDB

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
clothify/
├── app/                    # Next.js app directory
│   ├── admins/            # Admin dashboard pages
│   ├── api/               # API routes
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout process
│   ├── order/             # Order confirmation
│   ├── product/           # Product detail pages
│   └── shop/              # Product catalog
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── models/                # MongoDB data models
├── public/                # Static assets
└── src/                   # Additional source files
```

## 🗄️ Database Models

- **Admin**: Admin user accounts with authentication
- **Customer**: Customer user accounts
- **Product**: Clothing items with details and images
- **Order**: Customer orders with items and status

## 🔐 Authentication

- Admin authentication via `/api/auth` route
- JWT tokens stored in HTTP-only cookies
- Protected admin routes using middleware

## 🛒 Shopping Flow

1. Browse products in the shop
2. View product details
3. Add items to cart
4. Proceed to checkout
5. Complete order with confirmation
6. Track order status

## 📊 Admin Features

- **Dashboard**: Overview of orders, products, and customers
- **Product Management**: CRUD operations for clothing items
- **Order Management**: View order details and update status
- **Customer Management**: Monitor customer accounts

## 🚀 Deployment

The application can be deployed to Vercel, Netlify, or any platform supporting Next.js:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

For Vercel deployment, connect your GitHub repository and set environment variables in the Vercel dashboard.

## 🧪 Testing

Run the included test files:
```bash
node test-auth.js
node test-auth-flow.js
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth` - Admin login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/update-images` - Update product images (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/[id]` - Get single order (admin)
- `POST /api/orders` - Create order (customer)

### Customers
- `GET /api/customers` - Get all customers (admin)

### Admins
- `GET /api/admins` - Get all admins (admin)
- `POST /api/admins` - Create admin (admin)
- `DELETE /api/admins/[id]` - Delete admin (admin)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please open an issue in the GitHub repository.
