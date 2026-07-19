const express = require('express');
const router = express.Router();
const { getMentorGroups, getGroupDashboardDataForMentor } = require('../controllers/mentorController');
const { getUsers, getFeeTypes, assignFeeToUser, assignFeeToGroup, assignStudentToGroup } = require('../controllers/adminController');
const { protect, mentor } = require('../middleware/authMiddleware');

// All mentor routes are protected and require mentor role
router.use(protect, mentor);

router.get('/groups', getMentorGroups);
router.get('/groups/:id/dashboard', getGroupDashboardDataForMentor);

// Shared endpoints from admin controller
router.get('/users', getUsers);
router.get('/fee-types', getFeeTypes);
router.post('/fees/user', assignFeeToUser);
router.post('/fees/group', assignFeeToGroup);
router.post('/users/assign-group', assignStudentToGroup);

module.exports = router;
