const express = require('express');
const router = express.Router();
const { bulkCreateUsers, createGroup, getGroups, assignFeeToGroup, getUsers, updateUser, getAllFees, getLoans, updateLoanStatus, assignStudentToGroup, assignSubGroup, getGroupDashboardData, createFeeType, getFeeTypes, deleteFeeType, createScholarship, getScholarships, deleteScholarship } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes are protected and require admin role
router.use(protect, admin);

router.post('/bulk-users', bulkCreateUsers);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.post('/groups', createGroup);
router.get('/groups', getGroups);
router.post('/fees/group', assignFeeToGroup);
router.get('/fees', getAllFees);
router.get('/loans', getLoans);
router.put('/loans/status', updateLoanStatus);
router.post('/users/assign-group', assignStudentToGroup);
router.post('/groups/assign-subgroup', assignSubGroup);
router.get('/groups/:id/dashboard', getGroupDashboardData);

// Masters
router.post('/fee-types', createFeeType);
router.get('/fee-types', getFeeTypes);
router.delete('/fee-types/:id', deleteFeeType);

router.post('/scholarships', createScholarship);
router.get('/scholarships', getScholarships);
router.delete('/scholarships/:id', deleteScholarship);

module.exports = router;
