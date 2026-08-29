/**
 * Router Agent:
 * Analyzes the user's prompt intent, detects target department/category
 * (admissions, academics, examinations, hostel, placements, general),
 * and selects the optimal vector namespace.
 */

const DEPARTMENT_KEYWORDS = {
  admissions: [
    'admission', 'apply', 'application', 'eligibility', 'cutoff', 'fees', 'tuition',
    'scholarship', 'intake', 'quota', 'seat', 'enroll', 'counseling', 'form', 'prospectus'
  ],
  academics: [
    'syllabus', 'curriculum', 'credits', 'course', 'faculty', 'professor', 'semester',
    'attendance', 'leave', 'holiday', 'academic calendar', 'timetable', 'prerequisite', 'assignment'
  ],
  examinations: [
    'exam', 'examination', 'revaluation', 'grading', 'gpa', 'cgpa', 'arrear', 'backlog',
    'hall ticket', 'admit card', 'datesheet', 'supplementary', 'marksheet', 'transcript'
  ],
  hostel: [
    'hostel', 'mess', 'room', 'warden', 'curfew', 'outing', 'leave pass', 'room rent',
    'laundry', 'dorm', 'ragging', 'visitors', 'night out', 'canteen'
  ],
  placements: [
    'placement', 'internship', 'interview', 'package', 'ctc', 'company', 'recruiter',
    'resume', 'offer letter', 'tier 1', 'tier 2', 'drive', 'career', 'eligibility criteria'
  ]
};

const routeQuery = async ({ query, preferredDepartment = 'all' }) => {
  const q = (query || '').toLowerCase();

  // If the student explicitly picked a specific department (not 'all'), respect it
  if (preferredDepartment && preferredDepartment !== 'all') {
    return {
      department: preferredDepartment,
      confidence: 1.0,
      reason: `User explicitly targeted department: ${preferredDepartment}`,
      searchNamespace: preferredDepartment,
    };
  }

  // Calculate scores for each department based on keyword matching and context
  const scores = {
    admissions: 0,
    academics: 0,
    examinations: 0,
    hostel: 0,
    placements: 0,
  };

  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (q.includes(kw)) {
        scores[dept] += 1;
      }
    }
  }

  let bestDept = 'all';
  let highestScore = 0;

  for (const [dept, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestDept = dept;
    }
  }

  const confidence = highestScore >= 2 ? 0.95 : highestScore === 1 ? 0.75 : 0.5;

  return {
    department: bestDept,
    confidence,
    reason: highestScore > 0 
      ? `Detected ${highestScore} keyword match(es) for ${bestDept}` 
      : 'Broad campus inquiry; searching across all department namespaces',
    searchNamespace: bestDept,
  };
};

module.exports = {
  routeQuery,
  DEPARTMENT_KEYWORDS,
};
