# Task Management API Server

A robust, scalable REST API for task management built with Node.js, Express, and MongoDB.

## Architecture

### Project Structure

```
server/
├── config/           # Configuration files
│   ├── constants.js  # Application constants
│   ├── database.js   # Database connection
│   └── environment.js # Environment configuration
├── middleware/       # Express middleware
│   ├── auth.js       # JWT authentication
│   └── requestLogger.js # Request logging
├── models/          # Mongoose models
│   ├── Task.js      # Task model
│   └── User.js      # User model
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   └── tasks.js     # Task management routes
├── utils/           # Utility functions
│   ├── cache.js     # Caching utilities
│   ├── errorHandler.js # Error handling
│   ├── logger.js    # Logging utilities
│   └── validation.js # Input validation
├── tests/           # Test files
└── index.js         # Server entry point
```

### Key Features

- **Separation of Concerns**: Clear separation between routes, models, utilities, and configuration
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Comprehensive input validation for all endpoints
- **Caching**: In-memory caching for improved performance
- **Logging**: Structured logging with different levels
- **Security**: JWT authentication with proper middleware
- **Performance**: Optimized database connections and queries

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- Environment variables configured

### Environment Variables

Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-app
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
API_TIMEOUT=10000
CACHE_DURATION=300000
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Testing

```bash
npm test
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/validate-token` - Validate JWT token

### Tasks

- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Toggle task completion
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/subtasks` - Add subtask
- `DELETE /api/tasks/:id/subtasks/:index` - Remove subtask
- `PATCH /api/tasks/:id/subtasks/:index` - Toggle subtask completion
- `PATCH /api/tasks/:id/completion` - Update task completion only
- `PATCH /api/tasks/:id/due-date` - Set task due date

### Health Check

- `GET /health` - Server health status

## Error Handling

The application uses a centralized error handling system:

- **AppError**: Custom error class with status codes
- **asyncHandler**: Wrapper for async route handlers
- **globalErrorHandler**: Global error handling middleware
- **Validation**: Comprehensive input validation

## Caching

In-memory caching is implemented for:

- Task lists (5-minute TTL)
- Automatic cache invalidation on task modifications
- Configurable cache duration

## Logging

Structured logging with different levels:

- **ERROR**: Application errors
- **WARN**: Warning messages
- **INFO**: General information
- **DEBUG**: Detailed debugging (development only)

## Performance Optimizations

- Database connection pooling
- Query optimization with indexes
- Response caching
- Request debouncing
- Optimistic updates (client-side)

## Security

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable validation

## Testing

The application includes comprehensive tests:

- Unit tests for models
- Integration tests for routes
- Authentication tests
- Error handling tests

## Monitoring

- Request logging with timing
- Database operation logging
- Error tracking
- Health check endpoint

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use the established error handling patterns
5. Follow the logging conventions
