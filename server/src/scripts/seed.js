const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Document = require('../models/Document');
const { isInMemoryFallback } = require('../config/db');
const { ingestRawTextDocument } = require('../services/documentService');

const DEFAULT_DOCUMENTS = [
  {
    title: 'Admissions & Fee Regulations 2026-2027',
    department: 'admissions',
    totalPages: 5,
    text: `CAMPUS ACADEMIC REGISTRAR OFFICE - ADMISSIONS & FEE SCHEDULE (ACADEMIC YEAR 2026-2027)

1. ELIGIBILITY AND ADMISSION CRITERIA
Candidates seeking admission to undergraduate B.Tech/B.S programs must have completed 10+2 or equivalent examination with Physics, Mathematics, and Chemistry with a minimum aggregate of 60%. Admission rank cutoffs are published annually by the Central Admissions Board (CAB).

2. TUITION FEES AND PAYMENT DEADLINES
The standard annual tuition fee for engineering and technology undergraduate programs is Rs. 1,45,000 per academic year, payable in two equal installments (Rs. 72,500 by July 15 for Odd Semester, and Rs. 72,500 by December 15 for Even Semester). Late fee payments attract a penalty of Rs. 100 per day up to 14 days, after which course registration is temporarily suspended.

3. MERIT & NEED-BASED SCHOLARSHIPS
- Dean's Merit Scholarship: 50% tuition waiver for students achieving top 1 percentile rank in entrance examinations.
- Institutional Need-Based Aid: Up to 75% tuition assistance for students with verified annual family income below Rs. 3,50,000.
- Applications for semester fee concessions must be submitted to the Student Financial Aid Cell within 3 weeks of semester commencement.

4. REFUND AND WITHDRAWAL POLICY
If a candidate formally withdraws admission 15 days prior to orientation, 100% of tuition fee is refunded minus a processing charge of Rs. 1,000. For withdrawals made within 15 days of orientation, 80% is refunded. No tuition refunds are permitted after 30 days of formal session commencement.`,
  },
  {
    title: 'Academic Regulations & Course Credit System',
    department: 'academics',
    totalPages: 6,
    text: `COLLEGE SENATE ACADEMIC REGULATIONS HANDBOOK

1. MINIMUM ATTENDANCE REQUIREMENT
A student must secure a minimum of 75% attendance in each registered theory, tutorial, and laboratory course to be eligible to appear for the End-Semester Examination. Students with attendance between 65% and 74% on medical grounds certified by the Campus Chief Medical Officer may apply for condonation upon payment of a prescribed condonation fee of Rs. 1,500 per subject. Students with below 65% attendance are awarded 'W' (Withdrawn/Detained) grade and must repeat the course during summer or subsequent semesters.

2. CREDIT STRUCTURE AND COURSE LOAD
An undergraduate student must complete a minimum of 160 credits over 8 semesters to qualify for the award of Bachelor of Technology degree. The normal credit load per semester is 20-24 credits. Maximum permissible overload is 28 credits per semester, restricted to students maintaining a CGPA of 8.5 or higher.

3. COURSE DROP AND ELECTIVE SELECTION
Students can drop or change elective courses without academic penalty within the first 10 working days of the semester via the Campus ERP portal with approval from their assigned Faculty Academic Advisor.

4. ACADEMIC PROBATION
Students failing to achieve a semester GPA of 5.0 are placed on Academic Probation for the succeeding semester and required to attend mandatory remedial tutorials organized by the Department Dean.`,
  },
  {
    title: 'Examination Rules, Grading Scheme & Revaluation Manual',
    department: 'examinations',
    totalPages: 8,
    text: `CONTROLLER OF EXAMINATIONS (COE) - POLICY MANUAL

1. 10-POINT LETTER GRADING SYSTEM
Evaluation uses a standard 10-point absolute and relative grading scale:
- Grade 'O' (Outstanding): 10 Grade Points (Marks >= 90%)
- Grade 'A+' (Excellent): 9 Grade Points (Marks 80-89%)
- Grade 'A' (Very Good): 8 Grade Points (Marks 70-79%)
- Grade 'B+' (Good): 7 Grade Points (Marks 60-69%)
- Grade 'B' (Above Average): 6 Grade Points (Marks 50-59%)
- Grade 'C' (Pass): 5 Grade Points (Marks 40-49%)
- Grade 'F' (Fail): 0 Grade Points (Marks < 40%)

2. CGPA CALCULATION FORMULA
Cumulative Grade Point Average (CGPA) is computed as:
CGPA = Sum of (Course Credits * Grade Points) / Sum of (Course Credits)
All registered courses except non-credit audit courses are included in the CGPA computation.

3. ARREAR & SUPPLEMENTARY EXAMINATIONS
Students securing an 'F' grade in any course can register for Supplementary / Arrear Examinations conducted immediately after the vacation period. The registration fee is Rs. 800 per theory paper and Rs. 1,000 per laboratory examination.

4. REVALUATION AND ANSWER SCRIPT PHOTOCOPY
Students dissatisfied with evaluation may apply for a photocopy of their evaluated answer script within 7 days of result declaration upon payment of Rs. 500. Formal revaluation applications can be filed within 14 days of receiving the photocopy for a fee of Rs. 1,200 per paper. If marks improve by >= 15%, 50% of the revaluation fee is refunded.`,
  },
  {
    title: 'Hostel Code of Conduct & Residential Regulations',
    department: 'hostel',
    totalPages: 4,
    text: `OFFICE OF CHIEF WARDEN - HOSTEL RULES AND DISCIPLINARY CODE

1. ENTRY & CURFEW TIMINGS
All resident students must return to their respective hostel premises before 9:30 PM on weekdays and 10:00 PM on weekends. Biometric or smart card entry logs are recorded at the main gate. Late entries without prior approved permissions result in automated SMS notification to registered parent/guardian and a disciplinary fine of Rs. 500.

2. NIGHT-OUT AND LEAVE PASS PROCEDURE
Students requiring overnight absence or weekend home visits must submit an electronic Leave Pass via the Hostel Mobile Portal at least 24 hours in advance. Leave passes must be endorsed with OTP confirmation sent to registered parent contacts and approved by the resident Warden.

3. MESS REGULATIONS AND FOOD TIMINGS
Mess charges are billed on a fixed semester basis (Rs. 24,000 per semester). Meal service timings:
- Breakfast: 07:30 AM to 09:00 AM
- Lunch: 12:15 PM to 02:00 PM
- Evening Snacks: 05:00 PM to 06:15 PM
- Dinner: 07:30 PM to 09:15 PM
Mess rebate of Rs. 100 per day is eligible for continuous authorized absences exceeding 5 consecutive days.

4. ZERO-TOLERANCE ANTI-RAGGING DIRECTIVE
Ragging in any form is strictly prohibited under Supreme Court of India directives and Campus Anti-Ragging Statutes. Any student found engaging in ragging will face immediate suspension, hostel expulsion, and police reporting under criminal law.`,
  },
  {
    title: 'Placement Guidelines, Internship Policy & Code of Conduct',
    department: 'placements',
    totalPages: 5,
    text: `CAREER DEVELOPMENT & PLACEMENT CELL (CDPC) REGULATIONS

1. STUDENT ELIGIBILITY CRITERIA
To register for on-campus campus recruitment drives, students must:
- Maintain a minimum aggregate CGPA of 6.50 without any active backlogs/arrears at the time of company registration.
- Have a minimum of 80% attendance in placement training sessions and mock technical interviews.

2. ONE-STUDENT-ONE-OFFER POLICY
Under standard regulations, once a student receives a verified campus offer letter, they are considered placed and automatically deregistered from regular recruitment drives.
- Exception (Dream Offer): A placed student is permitted to participate in 'Dream Company' recruitment drives offering an annual CTC exceeding 2.0x of their initial offer (or CTC >= Rs. 15,00,000 LPA).

3. PRE-PLACEMENT TALK (PPT) AND ATTENDANCE MANDATE
Attendance in Pre-Placement Talks (PPT) of registered companies is compulsory. Unannounced absence from a scheduled interview or test after registering results in debarment from the next 3 consecutive recruitment drives.

4. INTERNSHIPS AND 8TH SEMESTER PROJECT CONVERSION
Students securing 6-month full-time internships at Tier-1 companies during their 8th semester are permitted to complete their final capstone project at the sponsoring company site with dual mentorship from corporate and department faculty advisors.`,
  }
];

const seedInitialData = async () => {
  console.log('[Seed] Checking initial demo accounts and knowledge base...');

  const inMem = isInMemoryFallback();
  const inMemoryUsers = global.__inMemoryUsers || new Map();
  global.__inMemoryUsers = inMemoryUsers;

  // 1. Seed Demo Student
  const studentEmail = 'student@campus.edu';
  const adminEmail = 'admin@campus.edu';
  const hashedPasswordStudent = await bcrypt.hash('Student@123', 12);
  const hashedPasswordAdmin = await bcrypt.hash('Admin@123', 12);

  if (inMem) {
    if (!inMemoryUsers.has('demo-student-id')) {
      inMemoryUsers.set('demo-student-id', {
        _id: 'demo-student-id',
        id: 'demo-student-id',
        name: 'Alex Vance (Student)',
        email: studentEmail,
        password: hashedPasswordStudent,
        role: 'student',
        department: 'academics',
        createdAt: new Date(),
      });
      console.log('[Seed] Demo student account created: student@campus.edu / Student@123');
    }

    if (!inMemoryUsers.has('demo-admin-id')) {
      inMemoryUsers.set('demo-admin-id', {
        _id: 'demo-admin-id',
        id: 'demo-admin-id',
        name: 'Dean Roberts (Admin)',
        email: adminEmail,
        password: hashedPasswordAdmin,
        role: 'admin',
        department: 'general',
        createdAt: new Date(),
      });
      console.log('[Seed] Demo admin account created: admin@campus.edu / Admin@123');
    }
  } else {
    const existingStudent = await User.findOne({ email: studentEmail });
    if (!existingStudent) {
      await User.create({
        name: 'Alex Vance (Student)',
        email: studentEmail,
        password: 'Student@123',
        role: 'student',
        department: 'academics',
      });
      console.log('[Seed] Demo student account seeded in MongoDB: student@campus.edu / Student@123');
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Dean Roberts (Admin)',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        department: 'general',
      });
      console.log('[Seed] Demo admin account seeded in MongoDB: admin@campus.edu / Admin@123');
    }
  }

  // 2. Seed Campus Policy Knowledge Base Documents
  for (const docData of DEFAULT_DOCUMENTS) {
    let exists = false;
    if (inMem) {
      exists = global.__inMemoryDocs && Array.from(global.__inMemoryDocs.values()).some(d => d.title === docData.title);
    } else {
      const found = await Document.findOne({ title: docData.title });
      exists = !!found;
    }

    if (!exists) {
      try {
        console.log(`[Seed] Ingesting & vectorizing: "${docData.title}" (${docData.department})...`);
        await ingestRawTextDocument({
          title: docData.title,
          department: docData.department,
          text: docData.text,
          totalPages: docData.totalPages,
        });
        console.log(`[Seed] Ingested & vectorized: "${docData.title}" (${docData.department})`);
      } catch (err) {
        console.warn(`[Seed] Error ingesting "${docData.title}": ${err.message}`);
      }
    }
  }
  console.log('[Seed] Campus Knowledge Base documents verified and synchronized.');
};

if (require.main === module) {
  const { connectDB } = require('../config/db');
  const { initVectorDb } = require('../config/vectorDb');
  (async () => {
    try {
      await connectDB();
      initVectorDb();
      await seedInitialData();
      console.log('[Seed] Standalone seeding completed.');
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}

module.exports = {
  seedInitialData,
  DEFAULT_DOCUMENTS,
};
