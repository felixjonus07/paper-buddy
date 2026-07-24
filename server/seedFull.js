require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const College = require('./models/College');
const User = require('./models/User');
const Group = require('./models/Group');
const FeeType = require('./models/FeeType');
const Fee = require('./models/Fee');
const StudentFee = require('./models/StudentFee');
const Payment = require('./models/Payment');
const AuditLog = require('./models/AuditLog');
const Scholarship = require('./models/Scholarship');

const hashPass = async (pw) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pw, salt);
};

const seedFull = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/paperbuddy');
    console.log('Connected to DB for Full Seeding...');

    // Wipe existing data
    await Promise.all([
      College.deleteMany(),
      User.deleteMany(),
      Group.deleteMany(),
      FeeType.deleteMany(),
      Fee.deleteMany(),
      StudentFee.deleteMany(),
      Payment.deleteMany(),
      AuditLog.deleteMany(),
      Scholarship.deleteMany()
    ]);
    console.log('Old data cleared.');

    // 1. Create College
    const college = await College.create({
      name: 'Paper Buddy Global University',
      code: 'PBGU',
      address: '123 Tech Lane, Innovation City',
      subscriptionStatus: 'active',
      paymentType: 'CENTRALIZED',
      aiAccess: true
    });

    // 2. Create SuperAdmin
    await User.create({
      name: 'Global Super Admin',
      username: 'superadmin',
      password: await hashPass('superadmin123'),
      role: 'superadmin'
    });

    // 3. Create Admin
    const admin = await User.create({
      name: 'College Admin',
      username: 'admin',
      password: await hashPass('admin123'),
      role: 'admin',
      collegeId: college._id
    });

    // 4. Create Cashier
    const cashier = await User.create({
      name: 'Campus Cashier',
      username: 'cashier',
      password: await hashPass('cashier123'),
      role: 'cashier',
      collegeId: college._id
    });
    
    // 4b. Create Group Admin (mentor)
    const mentor = await User.create({
      name: 'Group Admin (AIDSA)',
      username: 'aidsa',
      password: await hashPass('aidsa123'),
      role: 'mentor',
      collegeId: college._id
    });

    // 5. Create Groups
    const groupCS = await Group.create({
      name: 'B.Tech Computer Science 2026',
      description: 'CS Batch of 2026',
      collegeId: college._id,
      createdBy: admin._id
    });
    
    const groupMech = await Group.create({
      name: 'B.Tech Mechanical 2026',
      description: 'Mech Batch of 2026',
      collegeId: college._id,
      createdBy: admin._id
    });

    // 6. Create Fee Types
    const feeTypeTuition = await FeeType.create({ name: 'Tuition Fee', description: 'Annual Tuition', collegeId: college._id });
    const feeTypeLab = await FeeType.create({ name: 'Lab Fee', description: 'Practical Lab Fee', collegeId: college._id });
    const feeTypeTransport = await FeeType.create({ name: 'Transport Fee', description: 'Bus Transport', collegeId: college._id });

    // 7. Create Scholarships
    const scholarMerit = await Scholarship.create({
      name: 'Merit Scholarship',
      discountPercentage: 20,
      description: '20% off for high achievers',
      collegeId: college._id
    });

    // 8. Create Students (using the Quick Demo credentials)
    const student1 = await User.create({
      name: 'Demo Student',
      username: 'student',
      registerNumber: 'CS2026001',
      password: await hashPass('student123'),
      role: 'user',
      collegeId: college._id,
      groups: [groupCS._id],
      scholarship: scholarMerit._id,
      academicScore: 95
    });

    // 9. Create Fees
    const feeCS = await Fee.create({
      title: 'CS Annual Tuition',
      description: 'Full year tuition for CS',
      amount: 150000,
      feeType: feeTypeTuition._id,
      targetGroups: [groupCS._id],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: admin._id,
      collegeId: college._id
    });

    const feeLab = await Fee.create({
      title: 'Common Lab Fee',
      description: 'Lab resources',
      amount: 10000,
      feeType: feeTypeLab._id,
      targetGroups: [groupCS._id, groupMech._id],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      createdBy: admin._id,
      collegeId: college._id
    });

    // 10. Assign Student Fees
    const tuitionAmount = feeCS.amount * 0.8; // 20% discount
    const sf1 = await StudentFee.create({
      studentId: student1._id,
      groupId: groupCS._id,
      feeId: feeCS._id,
      baseAmount: feeCS.amount,
      discountAmount: feeCS.amount - tuitionAmount,
      finalAmount: tuitionAmount,
      status: 'PENDING',
      collegeId: college._id
    });
    
    const sf2 = await StudentFee.create({
      studentId: student1._id,
      groupId: groupCS._id,
      feeId: feeLab._id,
      baseAmount: feeLab.amount,
      discountAmount: 0,
      finalAmount: feeLab.amount,
      status: 'PENDING',
      collegeId: college._id
    });

    // 11. Create Payments
    sf2.status = 'PAID';
    await sf2.save();

    await Payment.create({
      user: student1._id,
      fee: feeLab._id,
      amount: feeLab.amount,
      transactionId: 'TXN_DUMMY_12345',
      paymentMethod: 'CASH',
      status: 'SUCCESS',
      collegeId: college._id,
      paidAt: new Date()
    });

    console.log('Seeding completed successfully!');
    console.log('--------------------------------');
    console.log('Test Accounts (Quick Demo Logins)');
    console.log('SuperAdmin: superadmin / superadmin123');
    console.log('Admin: admin / admin123');
    console.log('Cashier: cashier / cashier123');
    console.log('Group Admin: aidsa / aidsa123');
    console.log('Student: student / student123');
    process.exit(0);

  } catch (error) {
    console.error('Error in seeding:', error);
    process.exit(1);
  }
};

seedFull();
