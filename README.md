# EduPort - Scalable eLearning Platform

A comprehensive, cloud-native eLearning platform built with React, Node.js, and designed for AWS deployment. EduPort enables users to access courses, watch lectures, take quizzes, and track their learning progress with high availability and performance.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Students, Instructors, Admins)
- **Course Catalog**: Browse and search courses with filtering by category and difficulty
- **Video Learning**: Stream video lectures with progress tracking
- **Interactive Quizzes**: Take timed quizzes with instant feedback and scoring
- **Progress Tracking**: Monitor learning progress with detailed analytics
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **Three-Tier Architecture**: Clean separation of presentation, business logic, and data layers
- **RESTful API**: Comprehensive API with detailed documentation
- **JWT Authentication**: Secure token-based authentication
- **Real-time Updates**: Progress tracking and notifications
- **File Management**: Support for video, documents, and course materials
- **Database Optimization**: Indexed queries and efficient data structures

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Context API for authentication and global state
- **Routing**: React Router for client-side navigation
- **HTTP Client**: Axios with interceptors for API communication

### Backend (Node.js)
- **Runtime**: Node.js with Express.js framework
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, and input validation
- **File Upload**: Multer for handling file uploads (ready for S3 integration)
- **Error Handling**: Centralized error handling with detailed logging

### Database (MySQL/PostgreSQL)
- **Primary Database**: MySQL/PostgreSQL compatible schema
- **Data Structure**: Normalized tables with proper indexing
- **Relationships**: Foreign key constraints and referential integrity
- **Performance**: Optimized queries with proper indexes

## 🛠️ Technologies Used

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- MySQL2
- Helmet
- CORS
- Express Rate Limit

### Development Tools
- ESLint
- Prettier
- Git
- npm/yarn

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+ or PostgreSQL 12+
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd eduport
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Database Setup**
```bash
# Create database and run schema
mysql -u root -p < database/schema.sql
```

5. **Environment Configuration**
```bash
# Copy and configure environment variables
cp backend/.env.example backend/.env
# Edit .env with your database credentials and secrets
```

6. **Start the application**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🌐 AWS Deployment Architecture

### Infrastructure Components
- **Frontend**: React app hosted on Amazon S3 + CloudFront CDN
- **Backend**: Node.js API on Amazon EC2 with Elastic Load Balancer
- **Database**: Amazon RDS (MySQL/PostgreSQL) with Multi-AZ deployment
- **Storage**: Amazon S3 for course videos, materials, and user uploads
- **DNS**: Amazon Route 53 for custom domain management
- **Security**: AWS Certificate Manager for HTTPS, IAM roles for access control

### Deployment Steps
1. **Database**: Set up Amazon RDS instance and run schema
2. **Backend**: Deploy Node.js API to EC2 instances behind ALB
3. **Frontend**: Build React app and deploy to S3 + CloudFront
4. **DNS**: Configure Route 53 for custom domain
5. **Security**: Set up SSL certificates and security groups

## 📚 API Documentation

The API provides comprehensive endpoints for all platform functionality:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/my/enrolled` - Get enrolled courses

### Quizzes
- `GET /api/quizzes/:id` - Get quiz questions
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Progress
- `POST /api/progress/lesson/:id/complete` - Mark lesson complete
- `GET /api/progress/course/:id` - Get course progress

See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API reference.

## 🗄️ Database Schema

The database schema includes the following main tables:
- **users**: User accounts with role-based access
- **courses**: Course information and metadata
- **lessons**: Individual course lessons
- **enrollments**: User course enrollments
- **quizzes**: Quiz definitions and questions
- **quiz_attempts**: User quiz submissions
- **user_progress**: Learning progress tracking
- **reviews**: Course reviews and ratings

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=eduport
JWT_SECRET=your-super-secure-jwt-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=eduport-media-bucket
```

### AWS Configuration
- Configure IAM roles for EC2 and S3 access
- Set up security groups for database and application tiers
- Configure CloudFront distribution for static assets
- Set up Route 53 hosted zone for domain management

## 🚀 Production Deployment

### AWS Infrastructure Setup
1. **VPC and Networking**: Create VPC with public/private subnets
2. **Database**: Launch RDS instance in private subnet
3. **Application**: Deploy EC2 instances with Auto Scaling
4. **Load Balancer**: Configure Application Load Balancer
5. **CDN**: Set up CloudFront for global content delivery
6. **Monitoring**: Configure CloudWatch for logging and metrics

### CI/CD Pipeline
Set up automated deployment using:
- AWS CodePipeline for continuous integration
- AWS CodeBuild for building applications
- AWS CodeDeploy for automated deployments
- GitHub Actions for code quality checks

## 📊 Performance Optimization

### Frontend Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization with Webpack
- Service worker for offline capability

### Backend Optimizations
- Database query optimization and indexing
- Redis caching for frequently accessed data
- Connection pooling for database connections
- API response compression

### AWS Optimizations
- CloudFront caching strategies
- Auto Scaling based on demand
- RDS Read Replicas for read-heavy workloads
- S3 Transfer Acceleration for global uploads

## 🔒 Security Features

### Application Security
- JWT token-based authentication
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- SQL injection prevention
- XSS protection with security headers
- Rate limiting to prevent abuse

### AWS Security
- IAM roles and policies for least privilege access
- Security groups for network-level firewall
- SSL/TLS certificates for encrypted communication
- VPC isolation for network security
- Regular security updates and patches

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Unit tests for React components
- API endpoint testing
- Database integration tests
- Authentication flow testing

## 📈 Monitoring and Analytics

### Application Monitoring
- Error tracking and logging
- Performance metrics collection
- User activity analytics
- API response time monitoring

### AWS Monitoring
- CloudWatch metrics and alarms
- Application Load Balancer health checks
- RDS performance insights
- S3 access logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: Full-stack developers
- **DevOps Team**: AWS infrastructure specialists
- **UI/UX Team**: Design and user experience experts
- **QA Team**: Testing and quality assurance

## 📞 Support

For support and questions:
- Email: support@eduport.com
- Documentation: [API Docs](docs/API_DOCUMENTATION.md)
- Issues: GitHub Issues tracker

## 🚀 Future Enhancements

### Planned Features
- **Live Streaming**: Real-time video lectures with chat
- **Mobile Apps**: Native iOS and Android applications
- **AI Integration**: Personalized learning recommendations
- **Advanced Analytics**: Detailed learning analytics dashboard
- **Integration APIs**: Third-party LMS integrations
- **Offline Mode**: Download courses for offline viewing

### Technical Improvements
- **Microservices**: Break down monolithic API into microservices
- **GraphQL**: Implement GraphQL for flexible data fetching
- **WebRTC**: Peer-to-peer video calls for tutoring
- **Machine Learning**: Content recommendation engine
- **Blockchain**: Credential verification system

---

Built with ❤️ for the future of online education
