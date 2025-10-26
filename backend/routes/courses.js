const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const [courses] = await db.execute(`
      SELECT c.*, 
             CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
             COUNT(e.id) as enrolled_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_published = 1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json({ courses });
  } catch (error) {
    console.error('Courses fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const [courses] = await db.execute(`
      SELECT c.*, 
             CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
             u.email as instructor_email
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ? AND c.is_published = 1
    `, [req.params.id]);

    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get lessons for this course
    const [lessons] = await db.execute(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index',
      [req.params.id]
    );

    res.json({ 
      course: courses[0],
      lessons 
    });
  } catch (error) {
    console.error('Course fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

// Create new course (instructor/admin only)
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { title, description, category, difficulty, price } = req.body;

    const [result] = await db.execute(
      'INSERT INTO courses (title, description, category, difficulty, price, instructor_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, category, difficulty, price || 0, req.user.id]
    );

    res.status(201).json({
      message: 'Course created successfully',
      courseId: result.insertId
    });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Check if already enrolled
    const [existing] = await db.execute(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    await db.execute(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
});

// Get user's enrolled courses
router.get('/my/enrolled', authenticateToken, async (req, res) => {
  try {
    const [courses] = await db.execute(`
      SELECT c.*, 
             CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
             e.enrolled_at,
             COALESCE(p.progress_percentage, 0) as progress
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN (
        SELECT course_id, user_id, 
               (completed_lessons * 100.0 / total_lessons) as progress_percentage
        FROM user_progress
      ) p ON c.id = p.course_id AND e.user_id = p.user_id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `, [req.user.id]);

    res.json({ courses });
  } catch (error) {
    console.error('Enrolled courses fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled courses' });
  }
});

module.exports = router;