const express = require('express');

const router = express.Router();

const {
  authenticateUser,
  requireStudent
} = require('../middleware/authMiddleware');

const {
  getLessonProgress,
  saveLessonProgress,

  getQuiz,
  saveQuizAttempt,
  getLatestQuizAttempt,

  getScenario,
  saveScenarioAttempt,
  getLatestScenarioAttempt
} = require('../controllers/studentController');

// All routes below require a logged-in student
router.use(authenticateUser, requireStudent);

// Get progress for a lesson
router.get(
  '/lessons/:lessonId/progress',
  getLessonProgress
);

// Save progress for a lesson
router.put(
  '/lessons/:lessonId/progress',
  saveLessonProgress
);

// Get quiz questions and options
router.get(
  '/quizzes/:quizId',
  getQuiz
);

// Save a completed quiz attempt
router.post(
  '/quizzes/:quizId/attempts',
  saveQuizAttempt
);

// Get the logged-in student's latest quiz attempt
router.get(
  '/quizzes/:quizId/attempts/latest',
  getLatestQuizAttempt
);

// Get scenario with its choices
router.get(
  '/scenarios/:scenarioId',
  getScenario
);

// Save a completed scenario attempt
router.post(
  '/scenarios/:scenarioId/attempts',
  saveScenarioAttempt
);

// Get the logged-in student's latest scenario attempt
router.get(
  '/scenarios/:scenarioId/attempts/latest',
  getLatestScenarioAttempt
);

module.exports = router;