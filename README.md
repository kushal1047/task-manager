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
   - Health Check: http://localhost:5000/health

## 📚 Documentation

- **[Server Documentation](./server/README.md)**: Backend architecture and API documentation
- **[Client Documentation](./client/README.md)**: Frontend architecture and component documentation
- **[Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md)**: Performance improvements and optimizations
- **[Sound Feature](./SOUND_FEATURE.md)**: Audio feedback implementation details

## 🔧 Development

### Scripts

#### Root Level

```bash
npm install          # Install all dependencies
```

#### Server

```bash
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
```

#### Client

```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### Code Quality

The project follows strict coding standards:

- **Separation of Concerns**: Clear separation between layers
- **Error Handling**: Comprehensive error handling throughout
- **Validation**: Input validation on both client and server
- **Testing**: Unit and integration tests
- **Documentation**: Comprehensive documentation
- **Performance**: Optimized for speed and efficiency

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

### Test Coverage

- Unit tests for all components
- Integration tests for API endpoints
- Authentication tests
- Error handling tests

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Railway, or similar platform

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Netlify, Vercel, or similar platform
3. Configure environment variables

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Comprehensive validation on both ends
- **CORS Configuration**: Proper cross-origin handling
- **Environment Variables**: Secure configuration management
- **XSS Prevention**: Input sanitization

## 📊 Performance Features

- **Caching**: In-memory caching for API responses
- **Optimistic Updates**: Immediate UI feedback
- **Debouncing**: Reduced API calls
- **Lazy Loading**: Code splitting for better performance
- **Database Optimization**: Indexed queries and connection pooling
- **Bundle Optimization**: Minified and optimized builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code structure
4. Add tests for new features
5. Update documentation
6. Submit a pull request

### Development Guidelines

- Follow the established patterns and conventions
- Use the provided utilities and hooks
- Add comprehensive error handling
- Include proper validation
- Write tests for new functionality
- Update documentation

## 📈 Monitoring and Analytics

- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **User Analytics**: Usage pattern analysis
- **Health Checks**: Application health monitoring

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration
- **PWA Support**: Progressive Web App features
- **Advanced Filtering**: Task filtering and search
- **Data Export**: Export tasks to various formats
- **Theme Support**: Dark/light mode toggle
- **Internationalization**: Multi-language support
- **Mobile App**: React Native version
- **AI Integration**: Smart task suggestions

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- MongoDB team for the database
- Express.js team for the web framework
- All contributors and maintainers

---

**Built with ❤️ using modern web technologies**
