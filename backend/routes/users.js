const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, email, first_name, last_name, role, created_at,
             (SELECT COUNT(*) FROM enrollments WHERE user_id = users.id) as enrolled_courses
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    await db.execute(
      'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      [firstName, lastName, userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get enrolled courses count
    const [enrolledCount] = await db.execute(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?',
      [userId]
    );

    // Get completed courses count
    const [completedCount] = await db.execute(
      'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND progress_percentage = 100',
      [userId]
    );

    // Get quiz attempts count
    const [quizCount] = await db.execute(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?',
      [userId]
    );

    // Get recent activity
    const [recentActivity] = await db.execute(`
      SELECT 'lesson' as type, l.title as title, lp.completed_at as date
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.user_id = ?
      UNION ALL
      SELECT 'quiz' as type, q.title as title, qa.completed_at as date
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ?
      ORDER BY date DESC
      LIMIT 5
    `, [userId, userId]);

    res.json({
      stats: {
        enrolledCourses: enrolledCount[0].count,
        completedCourses: completedCount[0].count,
        quizAttempts: quizCount[0].count
      },
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;