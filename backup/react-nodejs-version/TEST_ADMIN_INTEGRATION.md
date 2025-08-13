# Admin Panel Integration Testing Guide

## Overview
The admin panel from cms-template has been successfully integrated with the commerce-nextjs project.

## What's Been Integrated

### 1. Authentication System
- Created `useAuth` hook at `/client/src/hooks/useAuth.ts`
- Created `useLanguage` hook at `/client/src/hooks/useLanguage.ts`
- Updated `AdminGuard` component to work with new auth system
- Added mock admin user in backend

### 2. Admin Dashboard Component
- Created new `AdminDashboard` component at `/client/src/components/admin/dashboard/AdminDashboard.tsx`
- Integrated with existing admin layout
- Connected to backend API endpoints

### 3. Backend API Endpoints
- Added `/api/admin/dashboard` endpoint for dashboard data
- Added `/api/auth/me` endpoint for user authentication check
- Updated mock auth service to support admin user type

### 4. Routing Updates
- Updated `/client/src/App.tsx` to use new AdminDashboard component
- Admin routes properly protected with AdminGuard

## How to Test

### 1. Start the Backend Server
```bash
cd /Users/admin/new_project/commerce-nextjs
npm start
# or
npm run dev
```
The server will run on http://localhost:3001

### 2. Start the Frontend Client
```bash
cd /Users/admin/new_project/commerce-nextjs/client
npm run dev
```
The client will run on http://localhost:5173

### 3. Test Admin Login
1. Navigate to http://localhost:5173/login
2. Use these credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

### 4. Access Admin Dashboard
After login, you'll be redirected to the admin dashboard where you can:
- View commerce statistics (products, orders, customers, revenue)
- Access quick actions for product management, order processing
- See system health and alerts
- Navigate to other admin sections

## Features Available

### Admin Dashboard Shows:
- Total Products count
- Total Orders with today's count
- Monthly Revenue with growth percentage
- Total Customers with new user count
- System alerts and notifications
- Recent activities
- Quick action buttons for common tasks

### Navigation Menu Includes:
- Dashboard (홈)
- Products Management
- Orders Management
- Customers Management
- Inventory Management
- Analytics & Reports
- Settings

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics

## Troubleshooting

### If login fails:
1. Make sure backend server is running on port 3001
2. Check console for any CORS errors
3. Verify the credentials are correct

### If dashboard doesn't load:
1. Check if you're properly authenticated
2. Verify the API endpoints are responding
3. Check browser console for errors

### If styles look broken:
1. Make sure Tailwind CSS is properly configured
2. Run `npm install` in the client directory if needed

## Next Steps

To fully complete the integration:
1. Connect real database for product/order/customer data
2. Implement real-time data updates
3. Add more admin features like:
   - Product CRUD operations
   - Order management workflow
   - Customer details and analytics
   - Inventory tracking
4. Add proper error handling and loading states
5. Implement data pagination and filtering

## Notes
- The current implementation uses mock data for demonstration
- Admin user type is set to 'ADMIN' for authorization
- Dashboard automatically refreshes data every 30 seconds
- All admin routes are protected with authentication guards