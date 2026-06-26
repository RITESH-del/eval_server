import { jest } from "@jest/globals";

const mockExamsCreate = jest.fn();
const mockExamsFindMany = jest.fn();
const mockExamsUpdate = jest.fn();
const mockExamsDelete = jest.fn();
const mockSessionsFindMany = jest.fn();
const mockSessionsFindFirst = jest.fn();
const mockUsersFindMany = jest.fn();

jest.unstable_mockModule("../../../db.js", () => ({
  default: {
    exams: {
      create: mockExamsCreate,
      findMany: mockExamsFindMany,
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
    it("should create an exam with generated uuid", async () => {
      const examData = {
        title: "Test Lab",
        total_marks: 100,
        created_by: "faculty-id-1",
      };

      const createdExam = {
        id: mockUUID,
        ...examData,
      };

      mockExamsCreate.mockResolvedValue(createdExam);

      const result = await facultyRepo.createLab(examData);

      expect(mockExamsCreate).toHaveBeenCalledWith({
        data: {
          id: mockUUID,
          title: "Test Lab",
          total_marks: 100,
          created_by: "faculty-id-1",
        },
      });

      expect(result).toEqual(createdExam);
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
    it("should update an exam", async () => {
      const updatedExam = { id: "exam-1", title: "Updated Lab" };

      mockExamsUpdate.mockResolvedValue(updatedExam);

      const result = await facultyRepo.updateLab("exam-1", {
        title: "Updated Lab",
      });

      expect(mockExamsUpdate).toHaveBeenCalledWith({
        where: { id: "exam-1" },
        data: { title: "Updated Lab" },
      });

      expect(result).toEqual(updatedExam);
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
});
