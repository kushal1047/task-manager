# Task Management Application

A full-stack MERN (MongoDB, Express.js, React, Node.js) task management application with modern architecture, comprehensive error handling, and excellent user experience.

## 🚀 Features

- **Task Management**: Create, update, delete, and organize tasks
- **Subtask Support**: Break down tasks into smaller subtasks
- **Due Date Tracking**: Set and track task deadlines
- **Real-time Updates**: Optimistic UI updates with error rollback
- **Authentication**: Secure JWT-based authentication
- **Sound Feedback**: Audio feedback for user interactions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Performance Optimized**: Caching, debouncing, and lazy loading
- **Comprehensive Testing**: Unit and integration tests
- **Error Handling**: Graceful error handling with user feedback

## 🏗️ Architecture

### Project Structure

```
task-management-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── config/         # Configuration constants
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── api.js          # API service layer
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Server configuration
│   ├── middleware/          # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── tests/              # Backend tests
│   └── index.js            # Server entry point
├── package.json
└── README.md
```

### Technology Stack

#### Frontend

- **React 19**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Axios**: HTTP client
- **Jest & Testing Library**: Testing framework

#### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Jest & Supertest**: Testing framework

## 🛠️ Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- npm or yarn

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-management-app
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create `.env` files in both server and client directories:

   **Server (.env)**

   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/task-app
   JWT_SECRET=your-secret-key-here
   CLIENT_URL=http://localhost:3000
   API_TIMEOUT=10000
   CACHE_DURATION=300000
   ```

   **Client (.env)**

   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

4. **Start the application**

   ```bash
   # Start server (from server directory)
   cd server
   npm run dev

   # Start client (from client directory)
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

**Built with ❤️ using modern web technologies**
