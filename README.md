# Tech Store Backend

E-commerce backend application built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a .env file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tech-store
   JWT_SECRET=your_super_secret_key_here
   NODE_ENV=development
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- User authentication (register/login)
- Product management
- Shopping cart functionality
- Order processing