# Solvit Frontend

A modern React frontend for the Solvit mental health platform, built with React, Tailwind CSS, and Vite.

## Features

- 🔐 **User Authentication**: Login and registration with OTP verification
- 🎥 **WebRTC Video Consultations**: 1-on-1 encrypted video/audio sessions with real-time in-call chat, screen sharing, and picture-in-picture
- ⏳ **Automated Session Timing**: Real-time in-call countdown timer with automatic termination at scheduled end time and 5m/1m warnings
- 🔄 **Network Resilience**: Seamless rejoining flow for active sessions during accidental disconnects or network dropouts
- 🕒 **Flexible 5-Minute Slot Scheduling**: Granular slot creation and recurring availability management (5-min intervals, max 45-min duration)
- 👤 **User Profile Management**: Complete profile with editable information
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🎨 **Modern UI**: Beautiful, accessible interface with smooth animations
- 🔒 **Protected Routes**: Secure navigation with authentication guards
- 📸 **Profile Picture Upload**: Image upload with preview functionality
- ✅ **Form Validation**: Comprehensive form validation with react-hook-form
- 🔔 **Toast Notifications**: User-friendly notifications with react-toastify & sonner

## Tech Stack

- **React 19** - Latest React with modern features
- **Vite 7** - Fast build tool and development server
- **VideoSDK.live** - Real-time WebRTC audio/video infrastructure
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router DOM v7** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern vector icons
- **React Toastify & Sonner** - Dual toast notification engines

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   └── Profile.jsx
├── App.jsx             # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend is configured to work with your Node.js Express backend:

- **Base URL**: `http://localhost:8000/api/v1`
- **Authentication**: JWT tokens stored in localStorage
- **File Upload**: Multipart form data for profile pictures
- **CORS**: Configured for credentials

### Available Endpoints

- `POST /clients/send-otp-register-email` - Send OTP for registration
- `POST /clients/verify-otp-register-email` - Verify OTP
- `POST /clients/register-client` - Register new user
- `POST /clients/login-client` - User login
- `POST /clients/logout-client` - User logout

## Features in Detail

### Authentication Flow

1. **Registration**:
   - User fills out registration form
   - Email verification with OTP
   - Profile picture upload (optional)
   - Account creation

2. **Login**:
   - Email and password authentication
   - JWT token storage
   - Automatic redirect to dashboard

3. **Protected Routes**:
   - Dashboard and Profile pages require authentication
   - Automatic redirect to login if not authenticated

### User Profile

- **Personal Information**: Name, username, email, phone
- **Preferences**: Gender, languages, topics of interest
- **Address**: City, area, pincode
- **Bio**: User description (optional)
- **Profile Picture**: Upload and preview functionality

### Form Validation

- **Real-time validation** with react-hook-form
- **Custom validation rules** for all fields
- **Error messages** displayed inline
- **Password confirmation** matching
- **Email format** validation
- **Phone number** format validation

## Customization

### Styling

The app uses Tailwind CSS for styling. You can customize:

- **Colors**: Modify the color palette in `tailwind.config.js`
- **Components**: Create custom components in the `components/` directory
- **Layout**: Adjust the layout structure in each page component

### Adding New Features

1. **New Pages**: Create components in the `pages/` directory
2. **New Routes**: Add routes in `App.jsx`
3. **New API Calls**: Add methods in `AuthContext.jsx`
4. **New Components**: Create reusable components in `components/` directory

## Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend has CORS configured properly
2. **API Connection**: Verify the backend is running on the correct port
3. **Build Errors**: Check for missing dependencies or syntax errors
4. **Styling Issues**: Ensure Tailwind CSS is properly configured

### Development Tips

- Use the React Developer Tools for debugging
- Check the browser console for API errors
- Use the Network tab to monitor API calls
- Test on different screen sizes for responsiveness

## Contributing

1. Follow the existing code structure
2. Use meaningful component and variable names
3. Add proper error handling
4. Test on different devices and browsers
5. Update documentation for new features

## Recent UI Improvements & Bug Fixing Log

- 🕒 **5-Minute Slot Time Picker**: Added dynamic 5-minute interval selection (`00, 05, 10, ..., 55`) across all slot scheduling interfaces.
- ⏱️ **45-Minute Maximum Consultation Window**: Enforced slot length limit to prevent scheduling beyond 45 minutes per booking.
- 📐 **Weekly Summary Badge Alignment**: Fixed badge clipping and divider line overlapping in `CounselorDashboardRecurringAvailabilityManager.jsx`.
- 🛑 **Strict Session Expiration**: Added real-time countdown timer in `MeetingContainer.jsx` that automatically terminates the call and frees hardware device tracks when the scheduled end time is reached.
- 🔔 **Early Expiration Notifications**: Integrated warning toasts at 5 minutes and 1 minute remaining before automatic session shutdown.
- 🔁 **Active Session Rejoin Support**: `LeaveScreen.jsx` allows immediate re-entry for accidental disconnects/network glitches as long as the scheduled slot is active.

## License

This project is part of the Solvit mental health platform.
