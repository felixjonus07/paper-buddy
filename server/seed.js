const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const bcrypt = require('bcryptjs');
const { sequelize, connectDB, isConnected } = require('./config/db');
const {
  AuditLog,
  College,
  Fee,
  FeeRequest,
  FeeType,
  Group,
  Loan,
  Payment,
  Scholarship,
  Settlement,
  StudentFee,
  User,
} = require('./models');

const seed = async () => {
  await connectDB();
  if (!isConnected()) {
    console.error('Could not connect to Supabase Postgres. Aborting seed.');
    process.exit(1);
  }

  const existingUsers = await User.count();
  if (existingUsers > 0) {
    console.log(`Database already has ${existingUsers} user(s). Skipping seed to avoid duplicates.`);
    await sequelize.close();
    process.exit(0);
  }

  console.log('Seeding realistic EduFin data into Supabase Postgres...');

  const hash = (pw) => bcrypt.hash(pw, 10);
  const [
    superPw,
    adminPw,
    cashierPw,
    aidsPw,
    studentPw,
  ] = await Promise.all([
    hash('superadmin@2007'),
    hash('admin@2007'),
    hash('cashier@2007'),
    hash('aids@2007'),
    hash('student@2007'),
  ]);

  // 1. Colleges
  const kit = await College.create({
    name: 'Karpagam Institute of Technology',
    code: 'KIT01',
    address: 'Bodipalayam Post, Coimbatore, Tamil Nadu 641105',
    phone: '+91 422 2611146',
    email: 'office@kitcbe.edu.in',
    administratorName: 'Dr. Ramesh Kumar',
    strength: 2400,
    subscriptionStatus: 'active',
    paymentType: 'CENTRALIZED',
    aiAccess: true,
    promptCount: 42,
    tokenCount: 18450,
  });

  const skec = await College.create({
    name: 'Sri Krishna Engineering College',
    code: 'SKEC01',
    address: 'Kuniamuthur, Coimbatore, Tamil Nadu 641008',
    phone: '+91 422 2678001',
    email: 'admin@skec.edu.in',
    administratorName: 'Prof. Anitha Devi',
    strength: 1800,
    subscriptionStatus: 'active',
    paymentType: 'DECENTRALIZED',
    aiAccess: true,
    promptCount: 15,
    tokenCount: 6200,
  });

  // 2. Superadmin & Staff
  const superadmin = await User.create({
    name: 'Platform Superadmin',
    username: 'superadmin',
    password: superPw,
    role: 'superadmin',
    personalEmail: 'superadmin@edufin.in',
  });

  const kitAdmin = await User.create({
    name: 'Dr. Ramesh Kumar',
    username: 'admin',
    password: adminPw,
    role: 'admin',
    collegeId: kit._id,
    collegeEmail: 'admin@kitcbe.edu.in',
    phoneNumber: '9842211001',
  });

  const skecAdmin = await User.create({
    name: 'Prof. Anitha Devi',
    username: 'skec_admin',
    password: adminPw,
    role: 'admin',
    collegeId: skec._id,
    collegeEmail: 'anitha@skec.edu.in',
    phoneNumber: '9842211002',
  });

  const cashier = await User.create({
    name: 'Suresh Babu',
    username: 'cashier',
    password: cashierPw,
    role: 'cashier',
    collegeId: kit._id,
    collegeEmail: 'cashier@kitcbe.edu.in',
    phoneNumber: '9842211003',
  });

  // 3. Fee Types (KIT)
  const [tuitionType, hostelType, labType, examType, busType] = await FeeType.bulkCreate([
    { name: 'Tuition Fee', description: 'Semester academic tuition charges', collegeId: kit._id },
    { name: 'Hostel & Mess', description: 'Accommodation and dining charges', collegeId: kit._id },
    { name: 'Lab & Library', description: 'Laboratory equipment and digital library access', collegeId: kit._id },
    { name: 'Exam Fee', description: 'End-semester university examination fee', collegeId: kit._id },
    { name: 'Transport Fee', description: 'College bus route pass', collegeId: kit._id },
  ], { returning: true });

  // 4. Scholarships (KIT)
  const [meritSch, needSch] = await Scholarship.bulkCreate([
    {
      name: 'Merit Excellence Scholarship',
      description: '25% waiver on Tuition and Lab fees for 85%+ scorers',
      discountPercentage: 25,
      applicableFeeTypes: [tuitionType._id, labType._id],
      minAcademicScore: 85,
      collegeId: kit._id,
    },
    {
      name: 'First-Graduate Support Grant',
      description: '15% waiver on Tuition fees for eligible students',
      discountPercentage: 15,
      applicableFeeTypes: [tuitionType._id],
      minAcademicScore: 60,
      collegeId: kit._id,
    },
  ], { returning: true });

  // 5. Groups (KIT)
  const allStudentsGrp = await Group.create({
    name: 'KIT All Students',
    description: 'Global group covering all enrolled students at KIT',
    isGlobal: true,
    collegeId: kit._id,
  });

  const [cseGrp, aidsGrp, hostelGrp] = await Group.bulkCreate([
    {
      name: 'B.Tech CSE',
      description: 'Computer Science & Engineering Department',
      parentGroups: [allStudentsGrp._id],
      collegeId: kit._id,
    },
    {
      name: 'B.Tech AI & DS',
      description: 'Artificial Intelligence & Data Science Department',
      parentGroups: [allStudentsGrp._id],
      collegeId: kit._id,
    },
    {
      name: 'Hostel Residents',
      description: 'Students residing in campus hostels',
      parentGroups: [allStudentsGrp._id],
      collegeId: kit._id,
    },
  ], { returning: true });

  const cse3AGrp = await Group.create({
    name: 'CSE - 3rd Year A',
    description: 'Third year Section A students',
    parentGroups: [cseGrp._id],
    collegeId: kit._id,
  });

  // Mentors (Group Admins)
  await User.bulkCreate([
    {
      name: 'Prof. Kavitha Nair',
      username: 'mentor_cse',
      password: aidsPw,
      role: 'mentor',
      collegeId: kit._id,
      groups: [cseGrp._id, cse3AGrp._id],
      collegeEmail: 'kavitha.cse@kitcbe.edu.in',
      phoneNumber: '9842211010',
    },
    {
      name: 'Prof. Arvind Raj',
      username: 'aids',
      password: aidsPw,
      role: 'mentor',
      collegeId: kit._id,
      groups: [aidsGrp._id],
      collegeEmail: 'arvind.aids@kitcbe.edu.in',
      phoneNumber: '9842211011',
    },
  ]);

  // 6. Students (first student uses username 'student' for quick-login)
  const studentProfiles = [
    { name: 'Aarav Sharma', username: 'student', cls: 'B.Tech CSE', sec: 'A', yr: '3', score: 91, grp: [allStudentsGrp._id, cseGrp._id, cse3AGrp._id, hostelGrp._id], sch: meritSch._id, phone: '9876543201' },
    { name: 'Diya Venkatesh', username: 'CS002', cls: 'B.Tech CSE', sec: 'A', yr: '3', score: 88, grp: [allStudentsGrp._id, cseGrp._id, cse3AGrp._id], sch: meritSch._id, phone: '9876543202' },
    { name: 'Karthik Subramanian', username: 'CS003', cls: 'B.Tech CSE', sec: 'A', yr: '3', score: 74, grp: [allStudentsGrp._id, cseGrp._id, cse3AGrp._id, hostelGrp._id], sch: needSch._id, phone: '9876543203' },
    { name: 'Meera Krishnan', username: 'CS004', cls: 'B.Tech CSE', sec: 'A', yr: '3', score: 69, grp: [allStudentsGrp._id, cseGrp._id, cse3AGrp._id], sch: null, phone: '9876543204' },
    { name: 'Rohan Menon', username: 'CS005', cls: 'B.Tech CSE', sec: 'B', yr: '2', score: 82, grp: [allStudentsGrp._id, cseGrp._id], sch: needSch._id, phone: '9876543205' },
    { name: 'Sneha Patel', username: 'CS006', cls: 'B.Tech CSE', sec: 'B', yr: '2', score: 77, grp: [allStudentsGrp._id, cseGrp._id, hostelGrp._id], sch: null, phone: '9876543206' },
    { name: 'Vikram Aditya', username: 'AD001', cls: 'B.Tech AI & DS', sec: 'A', yr: '3', score: 93, grp: [allStudentsGrp._id, aidsGrp._id, hostelGrp._id], sch: meritSch._id, phone: '9876543207' },
    { name: 'Priya Dharshini', username: 'AD002', cls: 'B.Tech AI & DS', sec: 'A', yr: '3', score: 79, grp: [allStudentsGrp._id, aidsGrp._id], sch: null, phone: '9876543208' },
    { name: 'Siddharth Rao', username: 'AD003', cls: 'B.Tech AI & DS', sec: 'A', yr: '2', score: 66, grp: [allStudentsGrp._id, aidsGrp._id, hostelGrp._id], sch: needSch._id, phone: '9876543209' },
    { name: 'Ananya Iyer', username: 'AD004', cls: 'B.Tech AI & DS', sec: 'A', yr: '2', score: 86, grp: [allStudentsGrp._id, aidsGrp._id], sch: meritSch._id, phone: '9876543210' },
  ];

  const students = await User.bulkCreate(
    studentProfiles.map((s) => ({
      name: s.name,
      username: s.username,
      registerNumber: `711524${s.username}`,
      password: studentPw,
      role: 'user',
      collegeId: kit._id,
      groups: s.grp,
      scholarship: s.sch,
      academicScore: s.score,
      studentClass: s.cls,
      section: s.sec,
      year: s.yr,
      phoneNumber: s.phone,
      personalEmail: `${s.username.toLowerCase()}@gmail.com`,
      collegeEmail: `${s.username.toLowerCase()}@kitcbe.edu.in`,
    })),
    { returning: true }
  );

  // SKEC sample students
  await User.bulkCreate([
    {
      name: 'Nikhil Verma',
      username: 'SK001',
      registerNumber: '722824SK001',
      password: studentPw,
      role: 'user',
      collegeId: skec._id,
      studentClass: 'B.E ECE',
      section: 'A',
      year: '2',
      academicScore: 81,
    },
    {
      name: 'Lavanya Mohan',
      username: 'SK002',
      registerNumber: '722824SK002',
      password: studentPw,
      role: 'user',
      collegeId: skec._id,
      studentClass: 'B.E ECE',
      section: 'A',
      year: '2',
      academicScore: 88,
    },
  ]);

  // 7. Fees
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  const [tuitionFee, labFee, hostelFee, examFee] = await Fee.bulkCreate([
    {
      title: 'Odd Semester Tuition Fee 2026-27',
      amount: 45000,
      feeType: tuitionType._id,
      assignedToGroup: allStudentsGrp._id,
      collegeId: kit._id,
      deadlineDate: nextMonth,
      lateFeeFine: 500,
      lateFeeFineType: 'total',
    },
    {
      title: 'CSE Lab & Cloud Credits Fee',
      amount: 6500,
      feeType: labType._id,
      assignedToGroup: cseGrp._id,
      collegeId: kit._id,
      deadlineDate: lastWeek,
      lateFeeFine: 50,
      lateFeeFineType: 'per day',
    },
    {
      title: 'Hostel & Mess Fee (Sem 1)',
      amount: 32000,
      feeType: hostelType._id,
      assignedToGroup: hostelGrp._id,
      collegeId: kit._id,
      deadlineDate: nextMonth,
      lateFeeFine: 1000,
      lateFeeFineType: 'total',
    },
    {
      title: 'University Exam Registration Fee',
      amount: 2500,
      feeType: examType._id,
      assignedToGroup: allStudentsGrp._id,
      collegeId: kit._id,
      deadlineDate: nextMonth,
      lateFeeFine: 0,
      lateFeeFineType: 'total',
    },
  ], { returning: true });

  // 8. StudentFees + Payments
  const schMap = new Map([
    [String(meritSch._id), meritSch],
    [String(needSch._id), needSch],
  ]);

  const computeDiscount = (student, fee) => {
    if (!student.scholarship) return 0;
    const sch = schMap.get(String(student.scholarship));
    if (!sch || student.academicScore < sch.minAcademicScore) return 0;
    const ok = !sch.applicableFeeTypes.length || sch.applicableFeeTypes.some((t) => String(t) === String(fee.feeType));
    return ok ? (fee.amount * sch.discountPercentage) / 100 : 0;
  };

  const sfRows = [];
  const paymentRows = [];
  const fees = [tuitionFee, labFee, hostelFee, examFee];

  students.forEach((st, idx) => {
    const stGroups = (st.groups || []).map(String);
    for (const fee of fees) {
      if (!stGroups.includes(String(fee.assignedToGroup))) continue;
      const disc = computeDiscount(st, fee);
      const finalAmt = Math.max(0, fee.amount - disc);
      // Mark tuition & exam as PAID for first 6 students, and some hostel fees paid
      const isPaid =
        (String(fee._id) === String(tuitionFee._id) && idx < 6) ||
        (String(fee._id) === String(examFee._id) && idx < 7) ||
        (String(fee._id) === String(hostelFee._id) && idx % 2 === 0);

      sfRows.push({
        studentId: st._id,
        groupId: fee.assignedToGroup,
        feeId: fee._id,
        baseAmount: fee.amount,
        discountAmount: disc,
        finalAmount: finalAmt,
        status: isPaid ? 'PAID' : 'PENDING',
        collegeId: kit._id,
      });

      if (isPaid) {
        const useCash = idx % 3 === 0;
        const paidDate = new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000);
        paymentRows.push({
          user: st._id,
          group: fee.assignedToGroup,
          fee: fee._id,
          amount: finalAmt,
          paymentMethod: useCash ? 'CASH' : 'PHONEPE',
          merchantTransactionId: useCash ? null : `MTSEED${Date.now()}${idx}`,
          providerTransactionId: useCash ? null : `PP${100000 + idx}`,
          status: 'SUCCESS',
          paidAt: paidDate,
          processedBy: useCash ? cashier._id : null,
          collegeId: kit._id,
        });
      }
    }
  });

  await StudentFee.bulkCreate(sfRows);
  await Payment.bulkCreate(paymentRows);

  // 9. Loans, Fee Requests, Settlements, Audit Logs
  await Loan.bulkCreate([
    {
      user: students[3]._id,
      amount: 45000,
      purpose: 'Semester tuition fee assistance (short-term)',
      status: 'pending',
    },
    {
      user: students[2]._id,
      amount: 32000,
      purpose: 'Hostel fee installment support',
      status: 'approved',
    },
  ]);

  await FeeRequest.bulkCreate([
    {
      studentId: students[3]._id,
      requestedFeeTitle: 'Medical Fee Waiver',
      amount: 5000,
      feeType: tuitionType._id,
      reason: 'Hospitalization during mid-semester; requesting partial fee concession.',
      status: 'pending',
      collegeId: kit._id,
    },
    {
      studentId: students[7]._id,
      requestedFeeTitle: 'Sports Quota Concession',
      amount: 4000,
      feeType: tuitionType._id,
      reason: 'Represented university at state-level athletics meet.',
      status: 'approved',
      collegeId: kit._id,
    },
  ]);

  await Settlement.bulkCreate([
    {
      collegeId: kit._id,
      amount: 100000,
      status: 'COMPLETED',
      reference: 'UTR-HDFC-20261110-001',
      initiatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    {
      collegeId: kit._id,
      amount: 50000,
      status: 'PENDING_ADMIN_CONFIRMATION',
      reference: 'UTR-HDFC-20261124-002',
      initiatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  await AuditLog.bulkCreate([
    {
      action: 'CREATED_COLLEGE',
      details: 'Created college: Karpagam Institute of Technology (KIT01)',
      performedBy: superadmin._id,
      collegeId: kit._id,
    },
    {
      action: 'PROVISIONED_ADMIN',
      details: `Provisioned admin account: ${kitAdmin.username}`,
      performedBy: superadmin._id,
      collegeId: kit._id,
    },
    {
      action: 'CREATED_COLLEGE',
      details: 'Created college: Sri Krishna Engineering College (SKEC01)',
      performedBy: superadmin._id,
      collegeId: skec._id,
    },
    {
      action: 'PROVISIONED_ADMIN',
      details: `Provisioned admin account: ${skecAdmin.username}`,
      performedBy: superadmin._id,
      collegeId: skec._id,
    },
  ]);

  console.log('Seed complete!');
  console.log(`- Colleges: 2`);
  console.log(`- Users: ${await User.count()}`);
  console.log(`- Groups: ${await Group.count()}`);
  console.log(`- Fees: ${await Fee.count()}, StudentFees: ${sfRows.length}, Payments: ${paymentRows.length}`);
  await sequelize.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
