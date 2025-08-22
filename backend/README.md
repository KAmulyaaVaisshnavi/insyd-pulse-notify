# Insyd Notification System - Backend

A scalable notification system backend for the Insyd architecture industry social platform.

## 🏗️ Architecture Overview

This backend is designed to handle notification events for a social platform, processing likes, comments, follows, and new posts. It's built with scalability in mind, starting simple for 100 DAUs and designed to scale to 1M+ DAUs.

## 🚀 Features

- **Event Processing**: Real-time processing of user interactions
- **Notification Management**: Create, read, update, and delete notifications
- **User Management**: Basic user profiles and preferences
- **RESTful API**: Clean, documented endpoints
- **MongoDB Integration**: Scalable document storage
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Comprehensive error management

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (ready for implementation)
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Steps

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup:**
   - Install MongoDB locally OR use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

Key environment variables:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insyd-notifications
FRONTEND_URL=http://localhost:8080
```

## 📚 API Endpoints

### Health Check
```http
GET /api/health
```

### Notifications
```http
GET    /api/notifications/:userId          # Get user notifications
PATCH  /api/notifications/:id/read         # Mark notification as read
PATCH  /api/notifications/users/:userId/read-all  # Mark all as read
DELETE /api/notifications/:id              # Delete notification
DELETE /api/notifications/users/:userId/clear     # Clear all notifications
GET    /api/notifications/users/:userId/stats     # Get notification stats
```

### Events
```http
POST   /api/events                         # Create new event
GET    /api/events                         # Get events (admin)
GET    /api/events/:eventId               # Get specific event
POST   /api/events/:eventId/retry         # Retry failed event
GET    /api/events/status/pending         # Get pending events
```

### Users
```http
GET    /api/users/:userId                 # Get/create user
GET    /api/users                        # Get all users
POST   /api/users/demo/seed              # Create demo users
PATCH  /api/users/:userId/preferences    # Update preferences
```

## 💡 Usage Examples

### Create a Like Event
```bash
curl -X POST http://localhost:3001/api/events \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "like",
    "sourceUserId": "user-1",
    "targetUserId": "user-2",
    "data": {
      "contentId": "post-123",
      "contentType": "post"
    }
  }'
```

### Get User Notifications
```bash
curl http://localhost:3001/api/notifications/user-2
```

## 🏗️ System Design

### Event Flow
1. **Event Creation**: User actions create events via POST /api/events
2. **Event Processing**: Events are immediately processed (POC) or queued (production)
3. **Notification Generation**: Notifications are created based on user preferences
4. **Notification Delivery**: Stored in database and available via API

### Database Schema

**Users Collection:**
- userId (unique identifier)
- name, email, avatar, profession
- preferences (notification settings)
- followers/following arrays

**Notifications Collection:**
- notificationId, userId, type
- title, message, sourceUser
- targetContent, isRead, timestamp
- Indexed for efficient queries

**Events Collection:**
- eventId, type, sourceUserId, targetUserId
- data, processed status
- Error handling and retry logic

## 📈 Scalability Considerations

### Current (100 DAUs)
- Single server deployment
- MongoDB with basic indexes
- In-memory event processing
- Polling for real-time updates

### Future Scale (1M DAUs)
- Horizontal scaling with load balancers
- Message queue (Redis/Kafka) for event processing
- Database sharding and read replicas
- WebSocket connections for real-time updates
- CDN for static assets
- Microservices architecture

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes all user inputs
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Error Handling**: Prevents information leakage

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run with coverage
npm run test:coverage

# Load testing
npm run test:load
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```bash
docker build -t insyd-backend .
docker run -p 3001:3001 insyd-backend
```

### Cloud Deployment
The backend is ready to deploy to:
- **Render**: Zero-config deployment
- **Railway**: Git-based deployment  
- **Heroku**: With buildpacks
- **Vercel**: Serverless functions
- **DigitalOcean**: App Platform

## 📊 Monitoring

Key metrics to monitor:
- API response times
- Event processing latency
- Database query performance
- Error rates
- Active connections

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI in .env
   - Ensure MongoDB is running
   - Check network connectivity

2. **CORS Errors**
   - Verify FRONTEND_URL in .env
   - Check CORS configuration

3. **Rate Limiting**
   - Adjust rate limits in server.js
   - Monitor request patterns

### Debug Mode
```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Check the API documentation
- Review the system design document