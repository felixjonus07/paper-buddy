const express = require('express');
const router = express.Router();
const { bulkCreateUsers, createGroup, updateGroup, createGroupMentor, getGroups, assignFeeToGroup, assignFeeToUser, getUsers, updateUser, getAllFees, getLoans, updateLoanStatus, assignStudentToGroup, assignSubGroup, getGroupDashboardData, createFeeType, getFeeTypes, deleteFeeType, createScholarship, getScholarships, deleteScholarship, deleteFee, getFeeRequests, updateFeeRequestStatus, getPaymentReports, updatePaymentSettings, getPaymentSettings } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes are protected and require admin role
router.use(protect, admin);

router.get('/reports/payments', getPaymentReports);
router.get('/college/payment-settings', getPaymentSettings);
router.put('/college/payment-settings', updatePaymentSettings);

router.post('/bulk-users', bulkCreateUsers);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.post('/groups/:groupId/mentor', createGroupMentor);
router.get('/groups', getGroups);
router.post('/fees/group', assignFeeToGroup);
router.post('/fees/user', assignFeeToUser);
router.get('/fees', getAllFees);
router.delete('/fees/:id', deleteFee);
router.get('/loans', getLoans);
router.put('/loans/status', updateLoanStatus);
router.post('/users/assign-group', assignStudentToGroup);
router.post('/groups/assign-subgroup', assignSubGroup);
router.get('/groups/:id/dashboard', getGroupDashboardData);

// Fee Requests
router.get('/fee-requests', getFeeRequests);
router.put('/fee-requests/:id', updateFeeRequestStatus);

// Masters
router.post('/fee-types', createFeeType);
router.get('/fee-types', getFeeTypes);
router.delete('/fee-types/:id', deleteFeeType);

router.post('/scholarships', createScholarship);
router.get('/scholarships', getScholarships);
router.delete('/scholarships/:id', deleteScholarship);

module.exports = router;
