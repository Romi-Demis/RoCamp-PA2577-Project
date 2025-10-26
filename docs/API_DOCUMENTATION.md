# EduPort API Documentation

## Overview
EduPort REST API provides endpoints for managing users, courses, quizzes, and progress tracking in the eLearning platform.

**Base URL:** `http://localhost:5000/api` (Development)  
**Production URL:** `https://your-api-domain.com/api`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

## Error Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student" // Optional: student, instructor, admin
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

### POST /auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

### GET /auth/profile
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## User Endpoints

### GET /users
Get all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "created_at": "2024-01-01T00:00:00.000Z",
      "enrolled_courses": 3
    }
  ]
}
```

### PUT /users/profile
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

### GET /users/dashboard
Get user dashboard statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "stats": {
    "enrolledCourses": 5,
    "completedCourses": 2,
    "quizAttempts": 8
  },
  "recentActivity": [
    {
      "type": "lesson",
      "title": "Introduction to HTML",
      "date": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Course Endpoints

### GET /courses
Get all published courses.

**Response:**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Web Development",
      "description": "Learn the basics of HTML, CSS, and JavaScript",
      "category": "Programming",
      "difficulty": "beginner",
      "price": 99.99,
      "instructor_name": "John Instructor",
      "enrolled_count": 150,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /courses/:id
Get course details with lessons.

**Response:**
```json
{
  "course": {
    "id": 1,
    "title": "Introduction to Web Development",
    "description": "Learn the basics of HTML, CSS, and JavaScript",
    "category": "Programming",
    "difficulty": "beginner",
    "price": 99.99,
    "instructor_name": "John Instructor",
    "instructor_email": "instructor@example.com"
  },
  "lessons": [
    {
      "id": 1,
      "title": "Introduction to HTML",
      "description": "Learn HTML basics",
      "duration_minutes": 30,
      "order_index": 1,
      "video_url": "https://example.com/video1.mp4"
    }
  ]
}
```

### POST /courses
Create a new course (Instructor/Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Advanced React Development",
  "description": "Master React.js with advanced patterns",
  "category": "Programming",
  "difficulty": "advanced",
  "price": 199.99
}
```

**Response:**
```json
{
  "message": "Course created successfully",
  "courseId": 5
}
```

### POST /courses/:id/enroll
Enroll in a course.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Successfully enrolled in course"
}
```

### GET /courses/my/enrolled
Get user's enrolled courses.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Web Development",
      "instructor_name": "John Instructor",
      "enrolled_at": "2024-01-01T00:00:00.000Z",
      "progress": 65.5
    }
  ]
}
```

---

## Quiz Endpoints

### GET /quizzes/:id
Get quiz with questions.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "quiz": {
    "id": 1,
    "title": "HTML & CSS Quiz",
    "description": "Test your HTML and CSS knowledge",
    "time_limit_minutes": 15,
    "passing_score": 70,
    "max_attempts": 3
  },
  "questions": [
    {
      "id": 1,
      "question_text": "What does HTML stand for?",
      "question_type": "multiple_choice",
      "options": ["HyperText Markup Language", "High Tech Modern Language"],
      "points": 1,
      "order_index": 1
    }
  ]
}
```

### POST /quizzes/:id/submit
Submit quiz answers.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "answers": {
    "1": "HyperText Markup Language",
    "2": "color"
  }
}
```

**Response:**
```json
{
  "message": "Quiz submitted successfully",
  "score": 85.5,
  "correctAnswers": 17,
  "totalQuestions": 20,
  "attemptId": 123
}
```

### GET /quizzes/my/attempts
Get user's quiz attempts.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "attempts": [
    {
      "id": 1,
      "quiz_title": "HTML & CSS Quiz",
      "course_title": "Web Development Basics",
      "score": 85.5,
      "completed_at": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

---

## Progress Endpoints

### POST /progress/lesson/:id/complete
Mark a lesson as completed.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Lesson marked as completed"
}
```

### GET /progress/course/:id
Get course progress for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "progress": {
    "completed_lessons": 8,
    "total_lessons": 12,
    "progress_percentage": 66.67
  },
  "completedLessons": [1, 2, 3, 4, 5, 6, 7, 8]
}
```

---

## Health Check

### GET /health
Check API server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "environment": "development"
}
```

---

## Rate Limiting
API requests are limited to 100 requests per 15-minute window per IP address.

## CORS
Cross-Origin Resource Sharing is enabled for the frontend domain specified in `FRONTEND_URL` environment variable.

## WebSocket Support
Real-time features like live chat during lessons will be implemented using WebSocket connections in future versions.

## File Upload
Course materials and user avatars can be uploaded to AWS S3. Endpoints will include:
- `POST /upload/avatar` - Upload user avatar
- `POST /upload/course-material` - Upload course files
- `POST /upload/video` - Upload video lessons

## Pagination
List endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Example: `GET /courses?page=2&limit=10`

## Filtering and Sorting
Course endpoints support filtering and sorting:
- `category` - Filter by category
- `difficulty` - Filter by difficulty level
- `sort` - Sort by: `created_at`, `title`, `price`, `rating`
- `order` - Sort order: `asc`, `desc`

Example: `GET /courses?category=Programming&difficulty=beginner&sort=created_at&order=desc`

## Error Handling
The API returns detailed error messages with appropriate HTTP status codes:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Security
- JWT tokens expire after 7 days
- Password hashing using bcrypt with 12 rounds
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention using parameterized queries