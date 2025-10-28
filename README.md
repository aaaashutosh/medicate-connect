# MedicateConnect

A comprehensive telemedicine platform that connects patients with healthcare providers through an intuitive web application. Built with modern web technologies for seamless healthcare management.

## Features

### For Patients
- **User Registration & Authentication**: Secure signup and login system
- **Doctor Directory**: Browse and search for healthcare providers by specialty
- **Appointment Booking**: Schedule appointments with preferred doctors
- **Real-time Messaging**: Communicate with doctors through integrated chat
- **Video/Audio Calls**: WebRTC-powered telemedicine consultations
- **Prescription Management**: View and track prescriptions digitally
- **Payment Integration**: Secure payment processing via eSewa
- **AI Health Assistant**: Get preliminary health guidance through AI chat
- **Dashboard**: Track appointments, messages, and health records

### For Doctors
- **Profile Management**: Complete doctor profiles with specialties
- **Appointment Management**: View and manage patient appointments
- **Patient Communication**: Secure messaging and video calls
- **Prescription Writing**: Digital prescription management
- **Schedule Management**: Set availability and manage time slots
- **Dashboard Analytics**: Track patient interactions and statistics

### For Administrators
- **User Management**: Oversee all users (patients and doctors)
- **Doctor Approval**: Manage doctor registrations and profiles
- **System Monitoring**: Access to system analytics and logs

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for state management
- **React Router** for navigation
- **WebRTC** for video/audio calls

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose for data storage
- **JWT** for authentication
- **Zod** for schema validation
- **Multer** for file uploads

### AI Integration
- **Google Gemini AI** for health assistant functionality

### Payment Integration
- **eSewa** payment gateway for secure transactions

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aaaashutosh/medicate-connect.git
   cd medicate-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/medicateconnect

   # JWT
   JWT_SECRET=your_jwt_secret_here

   # AI (Google Gemini)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Payment (eSewa)
   ESEWA_MERCHANT_CODE=your_esewa_merchant_code
   ESEWA_SECRET=your_esewa_secret

   # Server
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
medicate-connect/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── assets/        # Images and icons
├── server/                 # Backend Express server
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   ├── gemini.ts          # AI integration
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
├── uploads/               # File upload directory
└── package.json           # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile

### Doctors
- `GET /api/doctors` - Get all doctors
- `PATCH /api/admin/doctors/:id` - Update doctor profile

### Appointments
- `GET /api/appointments/patient/:patientId` - Get patient appointments
- `GET /api/appointments/doctor/:doctorId` - Get doctor appointments
- `GET /api/appointments/:id` - Get specific appointment
- `POST /api/appointments` - Create new appointment

### Messages
- `GET /api/messages/:userId1/:userId2` - Get messages between users
- `GET /api/conversations/:userId` - Get user conversations
- `POST /api/messages` - Send message

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/verify` - Verify payment

### AI Chat
- `POST /api/ai/chat` - Interact with AI health assistant

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies
- UI components from shadcn/ui
- Icons from Lucide React
- Payment integration with eSewa
- AI powered by Google Gemini

## Support

For support, email support@medicateconnect.com or join our Discord community.

---

**MedicateConnect** - Connecting Healthcare, One Click at a Time
