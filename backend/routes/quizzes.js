const express = require("express");
const db = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get all available quizzes
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [quizzes] = await db.execute(`
      SELECT 
        q.id,
        q.title,
        q.description,
        q.time_limit_minutes,
        c.title AS course_title,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.is_published = 1
      ORDER BY q.created_at DESC
    `);

    res.json({
      success: true,
      quizzes,
    });
  } catch (error) {
    console.error("Quizzes fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
});

// Get quiz by ID with additional details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [quizzes] = await db.execute(
      `SELECT q.*, c.title AS course_title, c.id AS course_id 
       FROM quizzes q
       JOIN courses c ON q.course_id = c.id
       WHERE q.id = ?`,
      [req.params.id]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const [questions] = await db.execute(
      `SELECT 
        id, 
        quiz_id, 
        question_text, 
        question_type, 
        options, 
        correct_answer,
        points,
        order_index
       FROM quiz_questions 
       WHERE quiz_id = ? 
       ORDER BY order_index`,
      [req.params.id]
    );

    // Parse options if they're stored as JSON strings
    const questionsWithParsedOptions = questions.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
    }));

    res.json({
      success: true,
      quiz: quizzes[0],
      questions: questionsWithParsedOptions,
    });
  } catch (error) {
    console.error("Quiz fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
    });
  }
});

// Enhanced quiz submission with validation and time tracking
router.post("/:id/submit", authenticateToken, async (req, res) => {
  try {
    const { answers, time_taken } = req.body;
    const quizId = req.params.id;
    const userId = req.user.id;

    // Validate input
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid answers format",
      });
    }

    // Get quiz details and questions
    const [quizzes] = await db.execute("SELECT * FROM quizzes WHERE id = ?", [
      quizId,
    ]);

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const [questions] = await db.execute(
      "SELECT id, correct_answer, points FROM quiz_questions WHERE quiz_id = ?",
      [quizId]
    );

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This quiz has no questions",
      });
    }

    // Calculate score with points
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const results = {};

    questions.forEach((question) => {
      totalPoints += question.points;
      const isCorrect = answers[question.id] === question.correct_answer;
      results[question.id] = {
        correct: isCorrect,
        correctAnswer: question.correct_answer,
      };

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    });

    const score = (earnedPoints / totalPoints) * 100;

    // Save quiz attempt with additional data
    const [result] = await db.execute(
      `INSERT INTO quiz_attempts 
       (user_id, quiz_id, score, correct_answers_count, total_questions, answers, time_taken, earned_points, total_points) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        quizId,
        score,
        correctAnswers,
        questions.length,
        JSON.stringify(answers),
        time_taken || null,
        earnedPoints,
        totalPoints,
      ]
    );

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      score: parseFloat(score.toFixed(2)),
      correctAnswers,
      totalQuestions: questions.length,
      earnedPoints,
      totalPoints,
      attemptId: result.insertId,
      results,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
    });
  }
});

// Enhanced quiz attempts with pagination and filtering
router.get("/my/attempts", authenticateToken, async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      quiz_id,
      course_id,
      min_score,
      max_score,
    } = req.query;

    let query = `
      SELECT 
        qa.id,
        qa.quiz_id,
        q.title as quiz_title,
        qa.score,
        qa.correct_answers_count as correct_answers,
        qa.total_questions,
        qa.earned_points,
        qa.total_points,
        qa.time_taken,
        qa.completed_at,
        c.id as course_id,
        c.title as course_title,
        c.slug as course_slug
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qa.user_id = ?
    `;

    const params = [req.user.id];

    // Add filters
    if (quiz_id) {
      query += " AND qa.quiz_id = ?";
      params.push(quiz_id);
    }

    if (course_id) {
      query += " AND c.id = ?";
      params.push(course_id);
    }

    if (min_score) {
      query += " AND qa.score >= ?";
      params.push(min_score);
    }

    if (max_score) {
      query += " AND qa.score <= ?";
      params.push(max_score);
    }

    query += " ORDER BY qa.completed_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [attempts] = await db.execute(query, params);

    // Get total count for pagination
    let countQuery =
      "SELECT COUNT(*) as total FROM quiz_attempts qa WHERE qa.user_id = ?";
    const countParams = [req.user.id];

    if (quiz_id) {
      countQuery += " AND qa.quiz_id = ?";
      countParams.push(quiz_id);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      attempts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("Quiz attempts fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz attempts",
    });
  }
});

// Get specific quiz attempt details
router.get("/attempts/:attemptId", authenticateToken, async (req, res) => {
  try {
    const [attempts] = await db.execute(
      `
      SELECT 
        qa.*,
        q.title as quiz_title,
        q.description as quiz_description,
        c.title as course_title,
        c.id as course_id
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qa.id = ? AND qa.user_id = ?
    `,
      [req.params.attemptId, req.user.id]
    );

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    const attempt = attempts[0];

    // Get the quiz questions and answers
    const [questions] = await db.execute(
      `SELECT 
        qq.id,
        qq.question_text,
        qq.question_type,
        qq.options,
        qq.correct_answer,
        qq.points,
        qq.order_index,
        JSON_UNQUOTE(JSON_EXTRACT(qa.answers, CONCAT('$."', qq.id, '"'))) AS user_answer
       FROM quiz_questions qq
       JOIN quiz_attempts qa ON qq.quiz_id = qa.quiz_id
       WHERE qq.quiz_id = ? AND qa.id = ?
       ORDER BY qq.order_index`,
      [attempt.quiz_id, attempt.id]
    );

    // Parse the options and answers
    const questionsWithDetails = questions.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
      user_answer: q.user_answer,
    }));

    res.json({
      success: true,
      attempt,
      questions: questionsWithDetails,
    });
  } catch (error) {
    console.error("Quiz attempt fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz attempt",
    });
  }
});

// Get quiz leaderboard
router.get("/:id/leaderboard", authenticateToken, async (req, res) => {
  try {
    const quizId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;

    const [leaderboard] = await db.execute(
      `SELECT 
        u.id as user_id,
        u.username,
        u.avatar_url,
        qa.score,
        qa.time_taken,
        qa.completed_at
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      WHERE qa.quiz_id = ?
      ORDER BY qa.score DESC, qa.time_taken ASC
      LIMIT ?`,
      [quizId, limit]
    );

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
});

module.exports = router;
