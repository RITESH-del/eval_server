import * as studentRepo from "./student.repository.js";

// ===== SIMPLE IN-MEMORY CACHE (for demo - use Redis in production) =====
const cache = new Map();

const getCacheKey = (type, id) => `${type}:${id}`;

const setCacheWithTTL = (key, value, ttlSeconds = 3600) => {
  cache.set(key, { data: value, expires: Date.now() + ttlSeconds * 1000 });
};

const getCached = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const invalidateCache = (key) => cache.delete(key);

// ===== Get student details (university_id + name) with caching =====
// Called from getExamById since JWT only has id/role/email
export const getStudentDetails = async (studentId) => {
  const cacheKey = getCacheKey("student_details", studentId);

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Only fetch 2 necessary columns - very lightweight query
  const details = await studentRepo.getStudentDetails(studentId);

  if (!details) {
    const err = new Error("Student not found");
    err.status = 404;
    throw err;
  }

  // Cache for 1 hour (student details rarely change)
  setCacheWithTTL(cacheKey, details, 3600);
  return details;
};

// ===== Profile with caching (1 hour TTL) =====
export const getProfile = async (studentId) => {
  const cacheKey = getCacheKey("profile", studentId);

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const profile = await studentRepo.getProfile(studentId);

  if (!profile) {
    const err = new Error("Student not found");
    err.status = 404;
    throw err;
  }

  // Cache for 1 hour (profile rarely changes)
  setCacheWithTTL(cacheKey, profile, 3600);
  return profile;
};

// ===== Exam list with pagination =====
export const getExams = async (studentId, page = 1) => {
  // Get lightweight session data
  const sessions = await studentRepo.getExamsListPaginated(studentId, page, 15);

  if (sessions.length === 0) {
    return {
      exams: [],
      pagination: {
        page,
        limit: 15,
        total: 0,
        hasMore: false,
      },
    };
  }

  // Batch fetch scores for all sessions in one query
  const sessionIds = sessions.map((s) => s.id);
  const scores = await studentRepo.getExamScoresBatch(sessionIds);

  // Create lookup map for O(1) access
  const scoreMap = new Map(
    scores.map((s) => [
      s.session_id,
      {
        manual: s._sum.manual_score || 0,
        autograding: s._sum.autograding_score || 0,
      },
    ])
  );

  // Get total count for pagination (cache this too)
  const cacheKey = getCacheKey("exam_count", studentId);
  let totalExams = getCached(cacheKey);
  if (!totalExams) {
    totalExams = await studentRepo.countStudentExams(studentId);
    setCacheWithTTL(cacheKey, totalExams, 1800); // 30 min cache
  }

  const exams = sessions.map((session) => {
    const scores = scoreMap.get(session.id) || {
      manual: 0,
      autograding: 0,
    };

    return {
      session_id: session.id,
      exam_id: session.exam_id,
      title: session.exams?.title,
      status: session.status,
      submitted_at: session.submitted_at,
      start_time: session.exams?.start_time,
      total_marks: session.exams?.total_marks,
      total_manual_score: scores.manual,
      total_autograding_score: scores.autograding,
      submission_count: session._count.submissions,
    };
  });

  return {
    exams,
    pagination: {
      page,
      limit: 15,
      total: totalExams,
      hasMore: page * 15 < totalExams,
    },
  };
};

// ===== Exam detail - removed user redundancy, use passed studentDetails =====
export const getExamById = async (examId, studentId, studentDetails) => {
  const session = await studentRepo.getExamById(examId, studentId);

  if (!session) {
    const err = new Error("Exam not found");
    err.status = 404;
    throw err;
  }

  // Use passed studentDetails instead of fetching from DB
  const response = {
    session_id: session.id,
    student_details: {
      university_id: studentDetails.university_id,
      name: studentDetails.name,
    },
    exam_details: {
      title: session.exams.title,
      total_marks: session.exams.total_marks,
    },
    total_manual_score:
      session.submissions?.reduce((sum, sub) => sum + (sub.manual_score || 0), 0) || 0,
    total_autograding_score:
      session.submissions?.reduce((sum, sub) => sum + (sub.autograding_score || 0), 0) || 0,
    responses: [],
  };

  // Group submissions by question
  const grouped = {};
  session.submissions.forEach((submission) => {
    const qid = submission.question_id;

    if (!grouped[qid]) {
      grouped[qid] = {
        question_id: qid,
        title: submission.question_bank.title,
        description: submission.question_bank.description,
        submission_history: [],
        autograding_score: submission.autograding_score,
        manual_score: submission.manual_score,
      };
    }

    grouped[qid].submission_history.push({
      id: submission.id,
      code: submission.submitted_code,
      language: submission.language,
      created_at: submission.created_at,
    });

    // Update with latest scores
    grouped[qid].autograding_score = submission.autograding_score;
    grouped[qid].manual_score = submission.manual_score;
  });

  response.responses = Object.values(grouped);
  return response;
};

// ===== Cache invalidation on result publish =====
export const invalidateExamCache = (studentId) => {
  invalidateCache(getCacheKey("profile", studentId));
  invalidateCache(getCacheKey("student_details", studentId));
  invalidateCache(getCacheKey("exam_count", studentId));
};