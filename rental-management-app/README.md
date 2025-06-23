# Equipment Rental Management System

A full-stack application for managing equipment rentals between farmers and renters.

## Features

- User Authentication (JWT-based Login & Signup)
- Equipment Listing (Farmers can list available equipment)
- Booking System (Farmers can rent from others)
- Dashboard (Manage listings, bookings, and user profiles)
- MongoDB Database (Using Mongoose for data management)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Project Structure

```
rental-management-app/
├── backend/                # Node.js (Express) Backend
│   ├── models/            # Mongoose Models
│   ├── routes/            # Express API Routes
│   ├── controllers/       # Business Logic
│   ├── middleware/        # Authentication & Error Handling
│   ├── config/           # Database Config
│   ├── server.js         # Main Express Server File
├── frontend/              # React.js Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI Components
│   │   ├── pages/        # Page Views
│   │   ├── context/      # Global State Management
│   │   ├── services/     # API Calls
│   │   ├── App.js        # Root Component
│   │   ├── index.js      # Main Entry Point
│   │   ├── public/       # Static Files
│   ├── .gitignore            # Ignore Unwanted Files
│   ├── package.json          # Dependencies & Scripts
│   └── README.md             # Documentation
```

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd rental-management-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/rental-management
JWT_SECRET=your-secret-key
PORT=5000
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Equipment
- GET /api/equipment - Get all equipment
- GET /api/equipment/:id - Get equipment by ID
- POST /api/equipment - Create new equipment
- PUT /api/equipment/:id - Update equipment
- DELETE /api/equipment/:id - Delete equipment

### Bookings
- GET /api/bookings - Get all bookings
- GET /api/bookings/:id - Get booking by ID
- POST /api/bookings - Create new booking
- PATCH /api/bookings/:id/status - Update booking status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 