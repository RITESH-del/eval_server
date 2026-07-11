import { jest } from "@jest/globals";

const mockExamsCreate = jest.fn();
const mockExamsFindMany = jest.fn();
const mockExamsUpdate = jest.fn();
const mockExamsDelete = jest.fn();
const mockSessionsFindMany = jest.fn();
const mockSessionsFindFirst = jest.fn();
const mockUsersFindMany = jest.fn();
const mockExamsFindUnique = jest.fn();

const mockTxExamsCreate = jest.fn();
const mockTxTargetSectionsCreateMany = jest.fn();
const mockTxQuestionBankCreate = jest.fn();
const mockTxTestCasesCreateMany = jest.fn();
const mockTxTestCasesDeleteMany = jest.fn();
const mockTxExamQuestionsCreate = jest.fn();

const mockTxExamsUpdate = jest.fn();
const mockTxTargetSectionsDeleteMany = jest.fn();
const mockTxExamQuestionsDeleteMany = jest.fn();
const mockTxQuestionBankFindUnique = jest.fn();
const mockTxQuestionBankUpdate = jest.fn();
const mockTxExamsFindUnique = jest.fn();

const mockTxClient = {
  exams: {
    create: mockTxExamsCreate,
    update: mockTxExamsUpdate,
    findUnique: mockTxExamsFindUnique,
  },
  exam_target_sections: {
    createMany: mockTxTargetSectionsCreateMany,
    deleteMany: mockTxTargetSectionsDeleteMany,
  },
  question_bank: {
    create: mockTxQuestionBankCreate,
    findUnique: mockTxQuestionBankFindUnique,
    update: mockTxQuestionBankUpdate,
  },
  test_cases: {
    createMany: mockTxTestCasesCreateMany,
    deleteMany: mockTxTestCasesDeleteMany,
  },
  exam_questions: {
    create: mockTxExamQuestionsCreate,
    deleteMany: mockTxExamQuestionsDeleteMany,
    createMany: jest.fn(),
  },
};

const mockTransaction = jest.fn((cb) => cb(mockTxClient));

jest.unstable_mockModule("../../../db.js", () => ({
  default: {
    $transaction: mockTransaction,
    exams: {
      create: mockExamsCreate,
      findMany: mockExamsFindMany,
      findUnique: mockExamsFindUnique,
      update: mockExamsUpdate,
      delete: mockExamsDelete,
    },
    student_exam_sessions: {
      findMany: mockSessionsFindMany,
      findFirst: mockSessionsFindFirst,
    },
    users: {
      findMany: mockUsersFindMany,
    },
  },
}));

const mockUUID = "test-uuid-123";

jest.unstable_mockModule("crypto", () => ({
  randomUUID: jest.fn(() => mockUUID),
}));

const facultyRepo = await import("../faculty.repository.js");

describe("Faculty Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLab", () => {
    it("should create a lab inside transaction with target sections and questions", async () => {
      const mockResultExam = { id: "exam-1", title: "Test Lab" };
      mockTxExamsCreate.mockResolvedValue(mockResultExam);

      const data = {
        id: "exam-1",
        title: "Test Lab",
        start_password: "pass",
        total_marks: 100,
        duration_minutes: 60,
        target_graduation_year: 2026,
        target_sections: ["A", "B"],
        start_time: new Date(),
        end_time: new Date(),
        created_by: "faculty-1",
        questions: [
          {
            id: "q-1",
            title: "Q1",
            statement: "code Q1",
            difficulty: "easy",
            marks: 20,
            subject_tag: "tag",
            testCases: [
              {
                id: "tc-1",
                input: "in",
                output: "out",
              }
            ]
          }
        ]
      };

      const result = await facultyRepo.createLab(data);

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockTxExamsCreate).toHaveBeenCalledWith({
        data: {
          id: data.id,
          title: data.title,
          start_password_hash: data.start_password,
          total_marks: data.total_marks,
          duration_minutes: data.duration_minutes,
          target_graduation_year: data.target_graduation_year,
          start_time: data.start_time,
          end_time: data.end_time,
          created_by: data.created_by,
        }
      });
      expect(mockTxTargetSectionsCreateMany).toHaveBeenCalledWith({
        data: [
          { exam_id: "exam-1", section: "A" },
          { exam_id: "exam-1", section: "B" },
        ]
      });
      expect(mockTxQuestionBankCreate).toHaveBeenCalledWith({
        data: {
          id: "q-1",
          title: "Q1",
          description: "code Q1",
          subject_tag: "tag",
          difficulty: "easy",
          created_by: "faculty-1",
        }
      });
      expect(mockTxTestCasesCreateMany).toHaveBeenCalledWith({
        data: [
          {
            id: "tc-1",
            question_id: "q-1",
            input_data: "in",
            expected_output: "out",
            is_hidden: true,
          }
        ]
      });
      expect(mockTxExamQuestionsCreate).toHaveBeenCalledWith({
        data: {
          exam_id: "exam-1",
          question_id: "q-1",
          marks_weightage: 20,
        }
      });
      expect(result).toEqual(mockResultExam);
    });
  });

  describe("getLabs", () => {
    it("should find exams by faculty id", async () => {
      const exams = [{ id: "1", title: "Lab 1" }];

      mockExamsFindMany.mockResolvedValue(exams);

      const result = await facultyRepo.getLabs("faculty-id-1");

      expect(mockExamsFindMany).toHaveBeenCalledWith({
        where: { created_by: "faculty-id-1" },
        include: { exam_target_sections: true },
      });

      expect(result).toEqual(exams);
    });

    it("should return empty array when no exams exist", async () => {
      mockExamsFindMany.mockResolvedValue([]);

      const result = await facultyRepo.getLabs("faculty-id-1");

      expect(result).toEqual([]);
    });
  });

  describe("getLabDetails", () => {
    it("should find sessions with includes by exam id", async () => {
      const sessions = [
        {
          id: "session-1",
          users: { name: "John" },
          exams: { title: "Lab 1" },
          submissions: [],
        },
      ];

      mockSessionsFindMany.mockResolvedValue(sessions);

      const result = await facultyRepo.getLabDetails("exam-1");

      expect(mockSessionsFindMany).toHaveBeenCalledWith({
        where: { exam_id: "exam-1" },
        include: {
          users: true,
          exams: {
            include: {
              exam_target_sections: true,
            },
          },
          submissions: true,
        },
      });

      expect(result).toEqual(sessions);
    });

    it("should return empty array when no sessions exist", async () => {
      mockSessionsFindMany.mockResolvedValue([]);

      const result = await facultyRepo.getLabDetails("exam-1");

      expect(result).toEqual([]);
    });
  });

  describe("updateLab", () => {
    it("should update an exam inside a transaction", async () => {
      const mockResultExam = { id: "exam-1", title: "Updated Lab" };
      mockTxExamsUpdate.mockResolvedValue(mockResultExam);
      mockTxExamsFindUnique.mockResolvedValue(mockResultExam);

      const data = {
        title: "Updated Lab",
        total_marks: 100,
        start_password: "pass",
        duration_minutes: 60,
        target_graduation_year: 2026,
        start_time: new Date(),
        end_time: new Date(),
        target_sections: ["A"],
        questions: [
          {
            id: "q-1",
            title: "Q1",
            statement: "code Q1",
            marks: 20,
            difficulty: "easy",
            subject_tag: "tag",
          }
        ],
        created_by: "faculty-1",
      };

      mockTxQuestionBankFindUnique.mockResolvedValue(null);

      const result = await facultyRepo.updateLab("exam-1", data);

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockTxExamsUpdate).toHaveBeenCalledWith({
        where: { id: "exam-1" },
        data: {
          title: data.title,
          total_marks: data.total_marks,
          start_password_hash: data.start_password,
          duration_minutes: data.duration_minutes,
          target_graduation_year: data.target_graduation_year,
          start_time: data.start_time,
          end_time: data.end_time,
        }
      });
      expect(mockTxTargetSectionsDeleteMany).toHaveBeenCalledWith({
        where: { exam_id: "exam-1" }
      });
      expect(mockTxExamQuestionsDeleteMany).toHaveBeenCalledWith({
        where: { exam_id: "exam-1" }
      });
      expect(result).toEqual(mockResultExam);
    });
  });

  describe("deleteLab", () => {
    it("should delete an exam", async () => {
      const deletedExam = { id: "exam-1" };

      mockExamsDelete.mockResolvedValue(deletedExam);

      const result = await facultyRepo.deleteLab("exam-1");

      expect(mockExamsDelete).toHaveBeenCalledWith({
        where: { id: "exam-1" },
      });

      expect(result).toEqual(deletedExam);
    });
  });

  describe("getAllSubmissions", () => {
    it("should find sessions by exam id", async () => {
      const sessions = [
        { id: "session-1", exam_id: "exam-1" },
      ];

      mockSessionsFindMany.mockResolvedValue(sessions);

      const result = await facultyRepo.getAllSubmissions("exam-1");

      expect(mockSessionsFindMany).toHaveBeenCalledWith({
        where: { exam_id: "exam-1" },
      });

      expect(result).toEqual(sessions);
    });

    it("should return empty array when no submissions exist", async () => {
      mockSessionsFindMany.mockResolvedValue([]);

      const result = await facultyRepo.getAllSubmissions("exam-1");

      expect(result).toEqual([]);
    });
  });

  describe("getSubmissionById", () => {
    it("should find session with includes", async () => {
      const session = {
        id: "session-1",
        users: { name: "John" },
        exams: { title: "Lab 1" },
        submissions: [
          {
            id: "sub-1",
            question_bank: { title: "Q1" },
            created_at: new Date(),
          },
        ],
      };

      mockSessionsFindFirst.mockResolvedValue(session);

      const result = await facultyRepo.getSubmissionById(
        "exam-1",
        "session-1"
      );

      expect(mockSessionsFindFirst).toHaveBeenCalledWith({
        where: { id: "session-1", exam_id: "exam-1" },
        include: {
          users: true,
          exams: true,
          submissions: {
            include: { question_bank: true },
            orderBy: { created_at: "asc" },
          },
        },
      });

      expect(result).toEqual(session);
    });

    it("should return null when session is not found", async () => {
      mockSessionsFindFirst.mockResolvedValue(null);

      const result = await facultyRepo.getSubmissionById(
        "exam-1",
        "nonexistent"
      );

      expect(result).toBeNull();
    });
  });

  describe("years", () => {
    it("should return distinct graduation years", async () => {
      const yearsData = [
        { graduation_year: 2025 },
        { graduation_year: 2026 },
      ];

      mockUsersFindMany.mockResolvedValue(yearsData);

      const result = await facultyRepo.years();

      expect(mockUsersFindMany).toHaveBeenCalledWith({
        distinct: ["graduation_year"],
        select: { graduation_year: true },
      });

      expect(result).toEqual(yearsData);
    });

    it("should return empty array when no users exist", async () => {
      mockUsersFindMany.mockResolvedValue([]);

      const result = await facultyRepo.years();

      expect(result).toEqual([]);
    });
  });

  describe("sections", () => {
    it("should return distinct sections for students", async () => {
      const sectionsData = [
        { section: "A" },
        { section: "B" },
      ];

      mockUsersFindMany.mockResolvedValue(sectionsData);

      const result = await facultyRepo.sections();

      expect(mockUsersFindMany).toHaveBeenCalledWith({
        where: { role: "student" },
        distinct: ["section"],
        select: { section: true },
      });

      expect(result).toEqual(sectionsData);
    });

    it("should return empty array when no students exist", async () => {
      mockUsersFindMany.mockResolvedValue([]);

      const result = await facultyRepo.sections();

      expect(result).toEqual([]);
    });
  });

  describe("getSessions", () => {
    it("should find all sessions with includes", async () => {
      const sessions = [
        {
          id: "session-1",
          users: { name: "John" },
          exams: { title: "Lab 1" },
          submissions: [],
        },
      ];

      mockSessionsFindMany.mockResolvedValue(sessions);

      const result = await facultyRepo.getSessions();

      expect(mockSessionsFindMany).toHaveBeenCalledWith({
        include: {
          users: true,
          exams: true,
          submissions: true,
        },
      });

      expect(result).toEqual(sessions);
    });

    it("should return empty array when no sessions exist", async () => {
      mockSessionsFindMany.mockResolvedValue([]);

      const result = await facultyRepo.getSessions();

      expect(result).toEqual([]);
    });
  });

  describe("findLabById", () => {
    it("should return basic lab details by id", async () => {
      const mockLab = { id: "exam-1", created_by: "faculty-1" };
      mockExamsFindUnique.mockResolvedValue(mockLab);

      const result = await facultyRepo.findLabById("exam-1");

      expect(mockExamsFindUnique).toHaveBeenCalledWith({
        where: { id: "exam-1" },
        select: {
          id: true,
          created_by: true,
          is_active: true,
          is_live: true,
        }
      });
      expect(result).toEqual(mockLab);
    });
  });

  describe("fetchLabById", () => {
    it("should return detailed lab with target sections and questions", async () => {
      const mockLab = {
        id: "exam-1",
        exam_target_sections: [],
        exam_questions: [],
      };
      mockExamsFindUnique.mockResolvedValue(mockLab);

      const result = await facultyRepo.fetchLabById("exam-1");

      expect(mockExamsFindUnique).toHaveBeenCalledWith({
        where: { id: "exam-1" },
        include: {
          exam_target_sections: true,
          exam_questions: {
            include: {
              question_bank: {
                include: {
                  test_cases: true,
                }
              }
            }
          }
        }
      });
      expect(result).toEqual(mockLab);
    });
  });
});
