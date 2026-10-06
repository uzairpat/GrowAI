const express = require('express');

const router = express.Router();

const { authenticateUser } = require('../middleware/authMiddleware');

const {
  getTeacherDashboard
} = require('../controllers/teacherController');

const {
  getTeacherClasses
} = require('../controllers/teacherClassesController');

const {
  getTeacherClassDetails
} = require('../controllers/teacherClassDetailsController');

const {
  getTeacherProgress
} = require('../controllers/teacherProgressController');

const {
  getTeacherResults
} = require('../controllers/teacherResultsController');

const {
  getTeacherAssignContent,
  postTeacherAssignContent
} = require('../controllers/teacherAssignContentController');

const {
  createTeacherAssignment,
} = require('../controllers/teacherAssignmentsController');

// Define the teacher-role guard locally so this route file does not depend
// on requireTeacher being exported from authMiddleware.js.
const requireTeacher = (req, res, next) => {
  const role = String(req.user?.role || '').toLowerCase();

  if (role !== 'teacher' && role !== 'school_admin') {
    return res.status(403).json({
      message: 'Access restricted to teacher accounts.'
    });
  }

  next();
};

router.use(authenticateUser, requireTeacher);

router.get('/dashboard', getTeacherDashboard);
router.get('/progress', getTeacherProgress);
router.get('/results', getTeacherResults);
router.get('/assign-content', getTeacherAssignContent);
router.post('/assign-content', postTeacherAssignContent);
router.get('/classes', getTeacherClasses);
router.get('/classes/:classId', getTeacherClassDetails);
router.post('/assignments', createTeacherAssignment);

module.exports = router;
