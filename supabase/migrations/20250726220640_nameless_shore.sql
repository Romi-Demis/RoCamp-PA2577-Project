-- EduPort eLearning Platform Database Schema
-- Compatible with MySQL 8.0+ and PostgreSQL 12+
-- Designed for AWS RDS deployment

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS eduport;
USE eduport;

-- Users table - stores user accounts with role-based access
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    profile_image VARCHAR(500) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- Courses table - stores course information
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    price DECIMAL(10, 2) DEFAULT 0.00,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    instructor_id INT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    duration_hours INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_difficulty (difficulty),
    INDEX idx_instructor (instructor_id),
    INDEX idx_published (is_published),
    INDEX idx_created_at (created_at)
);

-- Lessons table - stores individual lessons within courses
CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) DEFAULT NULL,
    content TEXT,
    duration_minutes INT DEFAULT 0,
    order_index INT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_order (course_id, order_index),
    INDEX idx_published (is_published)
);

-- Enrollments table - tracks student enrollments in courses
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_enrolled_at (enrolled_at)
);

-- Quizzes table - stores quiz information
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lesson_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit_minutes INT DEFAULT NULL,
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_lesson (lesson_id),
    INDEX idx_published (is_published)
);

-- Quiz questions table - stores individual quiz questions
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
    options JSON DEFAULT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT DEFAULT NULL,
    points INT DEFAULT 1,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_order (quiz_id, order_index)
);

-- Quiz attempts table - tracks student quiz attempts
CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    answers JSON NOT NULL,
    time_taken_minutes INT DEFAULT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_quiz (quiz_id),
    INDEX idx_score (score),
    INDEX idx_completed_at (completed_at)
);

-- Lesson progress table - tracks individual lesson completion
CREATE TABLE lesson_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    course_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lesson_progress (user_id, lesson_id),
    INDEX idx_user_course (user_id, course_id),
    INDEX idx_completed_at (completed_at)
);

-- User progress table - tracks overall course progress
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    completed_lessons INT DEFAULT 0,
    total_lessons INT DEFAULT 0,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_progress (user_id, course_id),
    INDEX idx_progress (progress_percentage),
    INDEX idx_last_accessed (last_accessed_at)
);

-- Course materials table - stores additional course resources
CREATE TABLE course_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lesson_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT DEFAULT NULL,
    order_index INT DEFAULT 0,
    is_downloadable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_lesson (lesson_id),
    INDEX idx_file_type (file_type)
);

-- Reviews table - stores course reviews and ratings
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (user_id, course_id),
    INDEX idx_course_rating (course_id, rating),
    INDEX idx_published (is_published),
    INDEX idx_created_at (created_at)
);

-- Notifications table - stores user notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_course_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_unread (user_id, is_read),
    INDEX idx_created_at (created_at)
);

-- Insert sample data for testing
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('adgedmin@eduport.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLRGKcLKrY8K7KW', 'Admin', 'User', 'admin'),
('instructor@eduport.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLRGKcLKrY8K7KW', 'John', 'Instructor', 'instructor'),
('student@eduport.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLRGKcLKrY8K7KW', 'Jane', 'Student', 'student');

INSERT INTO courses (title, description, category, difficulty, price, instructor_id, is_published) VALUES
('Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript', 'Programming', 'beginner', 99.99, 2, 1),
('Advanced React Development', 'Master React.js with hooks, context, and advanced patterns', 'Programming', 'advanced', 199.99, 2, 1),
('Digital Marketing Fundamentals', 'Complete guide to digital marketing strategies', 'Marketing', 'beginner', 149.99, 2, 1);

INSERT INTO lessons (course_id, title, description, duration_minutes, order_index) VALUES
(1, 'Introduction to HTML', 'Learn the basics of HTML markup', 30, 1),
(1, 'CSS Fundamentals', 'Understanding CSS selectors and properties', 45, 2),
(1, 'JavaScript Basics', 'Introduction to JavaScript programming', 60, 3),
(2, 'React Components', 'Building reusable React components', 40, 1),
(2, 'State Management with Hooks', 'Using useState and useEffect hooks', 50, 2);

INSERT INTO quizzes (course_id, title, description, time_limit_minutes, passing_score) VALUES
(1, 'HTML & CSS Quiz', 'Test your knowledge of HTML and CSS basics', 15, 70),
(2, 'React Components Quiz', 'Quiz on React component fundamentals', 20, 75);

INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
(1, 'What does HTML stand for?', 'multiple_choice', '["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"]', 'HyperText Markup Language', 1, 1),
(1, 'Which CSS property is used to change text color?', 'multiple_choice', '["color", "text-color", "font-color", "text-style"]', 'color', 1, 2),
(2, 'What is a React component?', 'multiple_choice', '["A reusable piece of UI", "A database table", "A CSS class", "A JavaScript function only"]', 'A reusable piece of UI', 1, 1);

-- Create views for common queries
CREATE VIEW course_stats AS
SELECT 
    c.id,
    c.title,
    COUNT(DISTINCT e.user_id) as enrolled_students,
    AVG(r.rating) as average_rating,
    COUNT(DISTINCT r.id) as total_reviews,
    COUNT(DISTINCT l.id) as total_lessons
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN reviews r ON c.id = r.course_id AND r.is_published = 1
LEFT JOIN lessons l ON c.id = l.course_id
GROUP BY c.id, c.title;

-- Create indexes for performance optimization
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE INDEX idx_courses_category_published ON courses(category, is_published);
CREATE INDEX idx_enrollments_user_date ON enrollments(user_id, enrolled_at);
CREATE INDEX idx_quiz_attempts_user_score ON quiz_attempts(user_id, score);
CREATE INDEX idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);

-- Grant permissions (adjust for your AWS RDS setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON eduport.* TO 'eduport_app'@'%';
-- FLUSH PRIVILEGES;

COMMIT;