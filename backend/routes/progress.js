const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update lesson progress
router.post('/lesson/:id/complete', authenticateToken, async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.id;

    // Get lesson info
    const [lessons] = await db.execute(
      'SELECT course_id FROM lessons WHERE id = ?',
      [lessonId]
    );

    if (lessons.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const courseId = lessons[0].course_id;

    // Mark lesson as completed
    await db.execute(`
      INSERT INTO lesson_progress (user_id, lesson_id, course_id, completed_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE completed_at = NOW()
    `, [userId, lessonId, courseId]);

    // Update overall course progress
    await updateCourseProgress(userId, courseId);

    res.json({ message: 'Lesson marked as completed' });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

// Get course progress
router.get('/course/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const [progress] = await db.execute(
      'SELECT * FROM user_progress WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    const [completedLessons] = await db.execute(
      'SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    res.json({
      progress: progress[0] || { completed_lessons: 0, total_lessons: 0, progress_percentage: 0 },
      completedLessons: completedLessons.map(l => l.lesson_id)
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// Helper function to update course progress
async function updateCourseProgress(userId, courseId) {
  try {
    // Get total lessons in course
    const [totalResult] = await db.execute(
      'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
      [courseId]
    );

    // Get completed lessons
    const [completedResult] = await db.execute(
      'SELECT COUNT(*) as completed FROM lesson_progress WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    const total = totalResult[0].total;
    const completed = completedResult[0].completed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    // Update or insert progress record
    await db.execute(`
      INSERT INTO user_progress (user_id, course_id, completed_lessons, total_lessons, progress_percentage)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        completed_lessons = ?, 
        total_lessons = ?, 
        progress_percentage = ?,
        updated_at = NOW()
    `, [userId, courseId, completed, total, percentage, completed, total, percentage]);

  } catch (error) {
    console.error('Course progress update error:', error);
  }
}

module.exports = router;