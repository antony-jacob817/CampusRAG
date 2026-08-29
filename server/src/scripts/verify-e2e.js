const { connectDB } = require('../config/db');
const { initVectorDb } = require('../config/vectorDb');
const { seedInitialData } = require('../scripts/seed');
const authService = require('../services/authService');
const { executeRagPipeline } = require('../services/ragService');
const documentService = require('../services/documentService');

async function runE2ETests() {
  console.log('==============================================');
  console.log('  CampusRAG Automated End-to-End Verification ');
  console.log('==============================================\n');

  try {
    // 1. Initialize DB & Vector Store
    console.log('[1/6] Connecting to Database & Vector Engine...');
    await connectDB();
    initVectorDb();
    await seedInitialData();
    console.log('  -> Initialization & Seeding: SUCCESS\n');

    // 2. Test Authentication (Student & Admin)
    console.log('[2/6] Verifying Authentication & JWT generation...');
    const studentAuth = await authService.login({
      email: 'student@campus.edu',
      password: 'Student@123',
    });
    console.log(`  -> Student Login: SUCCESS (User: ${studentAuth.user.name}, Role: ${studentAuth.user.role})`);

    const adminAuth = await authService.login({
      email: 'admin@campus.edu',
      password: 'Admin@123',
    });
    console.log(`  -> Admin Login: SUCCESS (User: ${adminAuth.user.name}, Role: ${adminAuth.user.role})\n`);

    // 3. Test Grounded Query Execution (Hostel / Mess Rules)
    console.log('[3/6] Testing Grounded RAG Query ("What are the hostel curfew timings and mess rules?")...');
    const groundedResult = await executeRagPipeline({
      threadId: 'test-thread-1',
      userQuery: 'What are the hostel curfew timings and mess food timings?',
      preferredDepartment: 'hostel',
      user: studentAuth.user,
    });

    console.log(`  -> Was Grounded: ${groundedResult.wasGrounded}`);
    console.log(`  -> Confidence Score: ${groundedResult.confidenceScore} (${Math.round(groundedResult.confidenceScore * 100)}%)`);
    console.log(`  -> Citations Generated: ${groundedResult.citations.length}`);
    if (groundedResult.citations.length > 0) {
      console.log(`  -> Top Citation: "${groundedResult.citations[0].title}", Page ${groundedResult.citations[0].pageNumber}`);
    }
    console.log(`  -> Response Preview: ${groundedResult.message.text.substring(0, 140)}...\n`);

    if (!groundedResult.wasGrounded || groundedResult.citations.length === 0) {
      throw new Error('Grounded query failed to return grounded context or citations.');
    }

    // 4. Test Out-of-Domain Query (Hallucination Prevention Guardrail)
    console.log('[4/6] Testing Out-of-Domain Query ("How do I build a nuclear reactor on Mars?")...');
    const ungroundedResult = await executeRagPipeline({
      threadId: 'test-thread-2',
      userQuery: 'How do I build a nuclear submarine on Mars?',
      preferredDepartment: 'all',
      user: studentAuth.user,
    });

    console.log(`  -> Was Grounded: ${ungroundedResult.wasGrounded} (Expected: false)`);
    console.log(`  -> Confidence Score: ${ungroundedResult.confidenceScore}`);
    console.log(`  -> Fallback Response Emitted: "${ungroundedResult.message.text}"\n`);

    if (ungroundedResult.wasGrounded) {
      throw new Error('Out-of-domain query should NOT be marked as grounded!');
    }

    // 5. Test Exam & Grading Query
    console.log('[5/6] Testing Exam & Grading Policy Query ("How is CGPA calculated and what is the revaluation fee?")...');
    const examResult = await executeRagPipeline({
      threadId: 'test-thread-3',
      userQuery: 'How is CGPA calculated and what is the revaluation fee?',
      preferredDepartment: 'examinations',
      user: studentAuth.user,
    });

    console.log(`  -> Was Grounded: ${examResult.wasGrounded}`);
    console.log(`  -> Citations: ${examResult.citations.map((c) => c.title).join(', ')}`);
    console.log(`  -> Response Preview: ${examResult.message.text.substring(0, 140)}...\n`);

    // 6. Test Document Management
    console.log('[6/6] Testing Document List Retrieval...');
    const docs = await documentService.listDocuments({});
    console.log(`  -> Total Indexed Documents: ${docs.length}`);
    docs.forEach((d) => console.log(`     - [${d.department.toUpperCase()}] ${d.title} (${d.totalChunks || 0} chunks)`));

    console.log('\n==============================================');
    console.log('  ALL END-TO-END TESTS PASSED SUCCESSFULLY!  ');
    console.log('==============================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[TEST FAILED]:', err);
    process.exit(1);
  }
}

runE2ETests();
