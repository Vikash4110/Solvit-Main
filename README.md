# Solvit - Counseling Platform

A comprehensive counseling platform with video calling, payment integration, and session management.

## 🚀 Recent Fixes Applied

### Frontend Fixes
1. **VideoCall Component**: Fixed Daily.co integration and API endpoints
2. **SessionSuccess Component**: Updated API endpoint paths
3. **BookCounselor Component**: Fixed authentication token usage
4. **API Configuration**: Corrected endpoint mappings to match backend routes

### Backend Fixes
1. **Server.js**: Added missing dailyService import
2. **Payment Controller**: Enhanced error handling and session management
3. **Auth Middleware**: Improved token validation and user type detection
4. **Session Routes**: Fixed middleware usage and route organization
5. **Daily.co Integration**: Enhanced room creation and token generation

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Daily.co account
- Razorpay account
- Cloudinary account

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/solvit_db

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Razorpay Configuration
RAZORPAY_API_KEY=your_razorpay_api_key_here
RAZORPAY_API_SECRET=your_razorpay_api_secret_here

# Daily.co Configuration
DAILY_API_KEY=your_daily_api_key_here
DAILY_DOMAIN=your_daily_domain_here

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN1=http://localhost:5173
CORS_ORIGIN2=http://localhost:3000

# Server Configuration
PORT=8000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_DAILY_API_KEY=your_daily_api_key_here
VITE_DAILY_DOMAIN=your_daily_domain_here
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Solvit-Main
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables**
   - Copy the environment variables above to respective `.env` files
   - Update with your actual API keys and credentials

5. **Start the backend server**
```bash
cd server
npm start
```

6. **Start the frontend development server**
```bash
cd client
npm run dev
```

## 🔧 Key Features Fixed

### Video Calling Integration
- ✅ Daily.co room creation and management
- ✅ Session token generation
- ✅ Real-time attendance tracking
- ✅ Participant join/leave events
- ✅ Session duration tracking

### Payment Integration
- ✅ Razorpay payment processing
- ✅ Payment verification
- ✅ Invoice generation
- ✅ Booking confirmation emails

### Authentication
- ✅ Enhanced JWT token validation
- ✅ Client and counselor authentication
- ✅ Token refresh mechanism
- ✅ Secure route protection

### Session Management
- ✅ Session scheduling
- ✅ Real-time status updates
- ✅ Attendance tracking
- ✅ Session completion handling

## 📁 Project Structure

```
Solvit-Main/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── config/        # API configuration
│   │   └── contexts/      # React contexts
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middlewares
│   └── utils/            # Utility functions
└── README.md
```

## 🚀 API Endpoints

### Authentication
- `POST /api/v1/clients/login-client` - Client login
- `POST /api/v1/counselors/login-counselor` - Counselor login
- `POST /api/v1/clients/register-client` - Client registration
- `POST /api/v1/counselors/register-counselor` - Counselor registration

### Booking & Sessions
- `GET /api/bookings/:bookingId/session-token` - Get session token
- `POST /api/bookings/:bookingId/attendance` - Update attendance
- `GET /api/bookings/:bookingId` - Get booking details

### Payment
- `POST /api/v1/payment/checkout` - Create payment order
- `POST /api/v1/payment/paymentverification` - Verify payment
- `GET /api/v1/payment/getkey` - Get Razorpay key

## 🔒 Security Features

- JWT token authentication
- CORS configuration
- Rate limiting
- Helmet security headers
- Input validation
- Error handling

## 🐛 Troubleshooting

### Common Issues

1. **Daily.co Integration Issues**
   - Ensure DAILY_API_KEY is set correctly
   - Check Daily.co account permissions
   - Verify room creation limits

2. **Payment Issues**
   - Verify Razorpay credentials
   - Check webhook configurations
   - Ensure proper amount formatting

3. **Authentication Issues**
   - Clear browser storage
   - Check token expiration
   - Verify JWT secrets

4. **Database Issues**
   - Check MongoDB connection
   - Verify database permissions
   - Check model validations

## 📞 Support

For technical support or questions, please contact the development team.

## 📄 License

This project is proprietary software. All rights reserved.
