# EduPort - Scalable eLearning Platform

A comprehensive, cloud-native eLearning platform built with React, Node.js, and designed for AWS deployment. EduPort enables users to access courses, watch lectures, take quizzes, and track their learning progress with high availability and performance.

## 🚀 Features

### Core Functionality
User Management:Secure user authentication with role-based access for Students, Instructors, and Administrators.
Course Catalog:Users can browse, search, and filter courses by category, difficulty level, and topic.
Video Learning:Students can stream lecture videos with automatic tracking of viewing progress.
Interactive Quizzes:Timed quizzes provide instant feedback and automatically calculate scores.
Progress Tracking:The platform records completed lessons and quiz results to display detailed learning progress.
Responsive Design:The user interface adapts seamlessly to desktops, tablets, and mobile devices for an optimal experience.

### Technical Features
Three-Tier Architecture:The system is designed with a clear separation between the frontend (presentation layer), backend API (business logic), and database (data layer), improving scalability and maintainability.
RESTful API:All backend functionality is exposed through well-structured REST endpoints that allow the frontend and external services to communicate with the system.
JWT Authentication:Secure authentication is implemented using JSON Web Tokens, ensuring that only authorized users can access protected resources.
Real-time Updates:The platform provides dynamic updates for user progress, quiz results, and learning activity without requiring full page reloads.
File Management:The system supports uploading and managing learning materials such as videos, documents, and course resources.
Database Optimization:The database uses indexed tables and optimized queries to ensure fast data retrieval and reliable performance, even as the number of users grows.

## 🏗️ Architecture

### Frontend (React)
Framework:Built using React 18 with TypeScript, providing a modern, strongly typed, and component-based user interface.
Styling:Styled with Tailwind CSS and a custom design system to ensure consistency, responsiveness, and a clean visual layout.
State Management:Uses the React Context API to manage authentication, user sessions, and global application state.
Routing:React Router is used for client-side navigation, allowing smooth transitions between pages without reloading.
API Communication:Axios is used as the HTTP client with interceptors for handling authentication tokens and error responses when communicating with the backend API.

### Backend (Node.js)
Runtime:The backend is built using Node.js with the Express.js framework to provide a fast, scalable, and lightweight REST API.
Authentication:User authentication is implemented using JSON Web Tokens (JWT) combined with bcrypt for secure password hashing and verification.
Security:Multiple security layers are applied, including Helmet for HTTP headers, CORS for cross-origin requests, rate limiting to prevent abuse, and input validation to protect against malicious data.
File Uploads:Multer is used to handle file uploads, allowing users to upload course materials such as videos and documents. The system is designed to integrate with cloud storage services such as Amazon S3.
Error Handling & Logging:The application uses centralized error handling with structured logging, making it easier to detect, debug, and resolve issues in production environments.

###Database (MySQL / PostgreSQL)
Primary Database:The platform uses a relational database compatible with MySQL and PostgreSQL to store user data, courses, quizzes, and learning progress.
Data Structure:The database schema is fully normalized with well-defined tables to reduce redundancy and improve data consistency.
Relationships & Integrity:Foreign key constraints are used to maintain strong relationships between tables, ensuring data integrity across users, courses, and enrollments.
Performance Optimization:Frequently accessed columns are indexed and queries are optimized to provide fast and reliable performance as the system scales.
## 🛠️ Technologies Used

### Frontend Technologies

React 18 – Modern JavaScript framework for building fast, component-based user interfaces
TypeScript – Provides static typing for safer and more maintainable code
Tailwind CSS – Utility-first CSS framework for responsive and consistent styling
React Router – Handles client-side navigation and page routing
Axios – HTTP client used for communication with the backend REST API
Lucide React Icons – Lightweight and customizable icon library for a polished user interface

### Backend Technologies

Node.js – High-performance JavaScript runtime for building scalable server-side applications
Express.js – Lightweight web framework for creating RESTful APIs
JWT (jsonwebtoken) – Used for secure user authentication and session management
bcryptjs – Provides secure password hashing and verification
MySQL2 – Database client for communicating with MySQL and PostgreSQL-compatible databases
Helmet – Adds HTTP security headers to protect against common web vulnerabilities
CORS – Controls cross-origin resource sharing for secure frontend–backend communication
Express Rate Limit – Protects the API from abuse by limiting excessive requests

###Development Tools

ESLint – Enforces consistent code quality and helps identify potential errors
Prettier – Automatically formats code to maintain a clean and readable styl
Git – Version control system used to manage source code and collaboration
npm / Yarn – Package managers for installing, managing, and running project dependencies

## 📦 Installation

### Prerequisites
To run and deploy the EduPort platform, the following tools must be installed:
Node.js 16+ and npm – Required to run and build both the frontend and backend services
MySQL 8.0+ or PostgreSQL 12+ – Used as the relational database for storing application data
Git – Used to clone the repository and manage version control

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

Frontend: http://localhost:8080 (via kubectl port-forward svc/frontend 8080:80)

Backend: http://localhost:5000/... (via kubectl port-forward svc/backend 5000:80)

  Docker Hub Images
Service	Docker Image

Backend API	https://hub.docker.com/r/romita71323/rocamp-backend

Frontend UI	https://hub.docker.com/r/romita71323/rocamp-frontend

These images are pulled by Kubernetes and run as independent microservices.

## 🌐## Kubernetes Deployment Architecture

The EduPort platform is deployed as a set of containerized microservices running on a Kubernetes cluster.

### Infrastructure Components
- **Frontend**
  The React application is built and served using an NGINX container and exposed through a Kubernetes Service and Ingress.
- **Backend**
  The Node.js REST API runs in its own Kubernetes Deployment and communicates with the database through a Kubernetes Service.
- **Database**
  PostgreSQL runs as a separate Kubernetes Deployment with a Persistent Volume Claim (PVC) to ensure data is retained across pod restarts.
- **Networking**
  Kubernetes Services provide internal communication between microservices, while an Ingress allows external browser access.
- **Scalability**
  The frontend and backend services are horizontally scalable using Kubernetes Horizontal Pod Autoscalers (HPA).
- **Container Registry**
  All container images are stored in Docker Hub and pulled by Kubernetes during deployment.


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
⚠️ This project is currently deployed using Docker and Kubernetes (Docker Desktop).
The AWS architecture described below represents a future cloud deployment plan and is not part of the current implementation.

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
