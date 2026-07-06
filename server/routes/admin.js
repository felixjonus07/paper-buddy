const express = require('express');
const router = express.Router();
const { bulkCreateUsers, createGroup, getGroups, assignFeeToGroup, getUsers, getAllFees, getLoans, updateLoanStatus, assignStudentToGroup, assignSubGroup } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes are protected and require admin role
router.use(protect, admin);

router.post('/bulk-users', bulkCreateUsers);
router.get('/users', getUsers);
router.post('/groups', createGroup);
router.get('/groups', getGroups);
router.post('/fees/group', assignFeeToGroup);
router.get('/fees', getAllFees);
router.get('/loans', getLoans);
router.put('/loans/status', updateLoanStatus);
router.post('/users/assign-group', assignStudentToGroup);
router.post('/groups/assign-subgroup', assignSubGroup);

module.exports = router;
