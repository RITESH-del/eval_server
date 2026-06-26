import { jest } from "@jest/globals";

jest.unstable_mockModule("../faculty.repository.js", () => ({
  createLab: jest.fn(),
  getLabs: jest.fn(),
  getLabDetails: jest.fn(),
  getAllSubmissions: jest.fn(),
  getSubmissionById: jest.fn(),
  years: jest.fn(),
  sections: jest.fn(),
  getSessions: jest.fn(),
}));

const facultyRepo = await import("../faculty.repository.js");

const {
  createLab,
  getLabs,
  getLabDetails,
  getAllSubmissions,
  getSubmissionById,
  getMetaData,
  getSessions,
} = await import("../faculty.service.js");

describe("Faculty Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLab", () => {
    it("should create a lab and return success message", async () => {
      facultyRepo.createLab.mockResolvedValue({
        id: "exam-1",
      });

      const examData = {
        title: "Test Lab",
        total_marks: 100,
      };

      const result = await createLab(examData, "faculty-id-1");

      expect(facultyRepo.createLab).toHaveBeenCalledWith({
        title: "Test Lab",
        total_marks: 100,
        created_by: "faculty-id-1",
      });

      expect(result).toBe("Exam created successfully");
    });
  });

  describe("getLabs", () => {
    it("should return labs for a faculty member", async () => {
      const labs = [
        {
          id: "exam-1",
          title: "Lab 1",
          exam_target_sections: [{ section: "A" }, { section: "B" }],
        },
        {
          id: "exam-2",
          title: "Lab 2",
          exam_target_sections: [],
        },
      ];

      facultyRepo.getLabs.mockResolvedValue(labs);

      const result = await getLabs("faculty-id-1");

      expect(facultyRepo.getLabs).toHaveBeenCalledWith(
        "faculty-id-1"
      );

      expect(result).toEqual([
        { id: "exam-1", title: "Lab 1", target_section: "A, B" },
        { id: "exam-2", title: "Lab 2", target_section: "" },
      ]);
    });

    it("should return empty array when no labs exist", async () => {
      facultyRepo.getLabs.mockResolvedValue([]);

      const result = await getLabs("faculty-id-1");

      expect(result).toEqual([]);
    });
  });

  describe("getLabDetails", () => {
    it("should map sessions with scores and student info", async () => {
      const sessions = [
        {
          id: "session-1",
          users: {
            university_id: "24CSE001",
            name: "John",
            section: "A",
          },
          submissions: [
            {
              language: "python",
              manual_score: 80,
              autograding_score: 90,
            },
            {
              language: "python",
              manual_score: 70,
              autograding_score: 85,
            },
          ],
          exams: {
            title: "Lab 1",
          },
          status: "submitted",
        },
      ];

      facultyRepo.getLabDetails.mockResolvedValue(sessions);

      const result = await getLabDetails("exam-1");

      expect(facultyRepo.getLabDetails).toHaveBeenCalledWith(
        "exam-1"
      );

      expect(result).toEqual([
        {
          session_id: "session-1",
          university_id: "24CSE001",
          name: "John",
          section: "A",
          language: "python",
          status: "submitted",
          total_manual_score: 150,
          total_autograding_score: 175,
          title: "Lab 1",
        },
      ]);
    });

    it("should handle session with no submissions", async () => {
      const sessions = [
        {
          id: "session-1",
          users: {
            university_id: "24CSE001",
            name: "John",
            section: "A",
          },
          submissions: [],
          exams: {
            title: "Lab 1",
          },
          status: "allocated",
        },
      ];

      facultyRepo.getLabDetails.mockResolvedValue(sessions);

      const result = await getLabDetails("exam-1");

      expect(result).toEqual([
        {
          session_id: "session-1",
          university_id: "24CSE001",
          name: "John",
          section: "A",
          language: undefined,
          status: "allocated",
          total_manual_score: null,
          total_autograding_score: null,
          title: "Lab 1",
        },
      ]);
    });
  });

  describe("getAllSubmissions", () => {
    it("should return all submissions for an exam", async () => {
      const submissions = [
        { id: "session-1", exam_id: "exam-1" },
      ];

      facultyRepo.getAllSubmissions.mockResolvedValue(
        submissions
      );

      const result = await getAllSubmissions("exam-1");

      expect(facultyRepo.getAllSubmissions).toHaveBeenCalledWith(
        "exam-1"
      );

      expect(result).toEqual(submissions);
    });

    it("should return empty array when no submissions exist", async () => {
      facultyRepo.getAllSubmissions.mockResolvedValue([]);

      const result = await getAllSubmissions("exam-1");

      expect(result).toEqual([]);
    });
  });

  describe("getSubmissionById", () => {
    it("should group submissions by question", async () => {
      const session = {
        id: "session-1",
        users: {
          university_id: "24CSE001",
          name: "John",
        },
        exams: {
          title: "Lab 1",
        },
        submissions: [
          {
            id: "sub-1",
            question_id: "q1",
            created_at: new Date("2025-01-01"),
            autograding_score: 90,
            manual_score: 80,
            question_bank: {
              title: "Question 1",
              description: "First question",
            },
          },
          {
            id: "sub-2",
            question_id: "q1",
            created_at: new Date("2025-01-02"),
            autograding_score: 95,
            manual_score: 85,
            question_bank: {
              title: "Question 1",
              description: "First question",
            },
          },
          {
            id: "sub-3",
            question_id: "q2",
            created_at: new Date("2025-01-01"),
            autograding_score: 100,
            manual_score: 90,
            question_bank: {
              title: "Question 2",
              description: "Second question",
            },
          },
        ],
      };

      facultyRepo.getSubmissionById.mockResolvedValue(session);

      const result = await getSubmissionById("exam-1", "session-1");

      expect(facultyRepo.getSubmissionById).toHaveBeenCalledWith(
        "exam-1",
        "session-1"
      );

      expect(result.session_id).toBe("session-1");
      expect(result.student_details).toEqual({
        university_id: "24CSE001",
        name: "John",
      });
      expect(result.exam_details).toEqual({
        title: "Lab 1",
      });

      expect(result.responses).toHaveLength(2);

      const q1 = result.responses.find(
        (r) => r.question_id === "q1"
      );
      expect(q1.title).toBe("Question 1");
      expect(q1.submission_history).toHaveLength(2);
      expect(q1.autograding_score).toBe(95);
      expect(q1.manual_score).toBe(85);

      const q2 = result.responses.find(
        (r) => r.question_id === "q2"
      );
      expect(q2.title).toBe("Question 2");
      expect(q2.submission_history).toHaveLength(1);
      expect(q2.autograding_score).toBe(100);
      expect(q2.manual_score).toBe(90);
    });
  });

  describe("getMetaData", () => {
    it("should return sorted years and sections", async () => {
      facultyRepo.years.mockResolvedValue([
        { graduation_year: 2026 },
        { graduation_year: 2024 },
        { graduation_year: 2025 },
        { graduation_year: 2027 },
        { graduation_year: 2028 },
      ]);

      facultyRepo.sections.mockResolvedValue([
        { section: "B" },
        { section: "A" },
        { section: "C" },
      ]);

      const result = await getMetaData();

      expect(facultyRepo.years).toHaveBeenCalled();
      expect(facultyRepo.sections).toHaveBeenCalled();

      expect(result).toEqual({
        target_graduation_year: [2024, 2025, 2026, 2027],
        target_section: ["A", "B", "C"],
      });
    });

    it("should handle empty data", async () => {
      facultyRepo.years.mockResolvedValue([]);
      facultyRepo.sections.mockResolvedValue([]);

      const result = await getMetaData();

      expect(result).toEqual({
        target_graduation_year: [],
        target_section: [],
      });
    });

    it("should limit to last 4 graduation years", async () => {
      facultyRepo.years.mockResolvedValue([
        { graduation_year: 2023 },
        { graduation_year: 2024 },
        { graduation_year: 2025 },
        { graduation_year: 2026 },
        { graduation_year: 2027 },
      ]);

      facultyRepo.sections.mockResolvedValue([]);

      const result = await getMetaData();

      expect(result.target_graduation_year).toEqual([
        2024, 2025, 2026, 2027,
      ]);
    });
  });

  describe("getSessions", () => {
    it("should map sessions with scores", async () => {
      const sessions = [
        {
          id: "session-1",
          users: {
            university_id: "24CSE001",
            name: "John",
            section: "A",
          },
          submissions: [
            {
              language: "python",
              manual_score: 80,
              autograding_score: 90,
            },
          ],
          exams: {
            title: "Lab 1",
          },
          status: "submitted",
        },
      ];

      facultyRepo.getSessions.mockResolvedValue(sessions);

      const result = await getSessions();

      expect(facultyRepo.getSessions).toHaveBeenCalled();

      expect(result).toEqual([
        {
          session_id: "session-1",
          university_id: "24CSE001",
          name: "John",
          section: "A",
          language: "python",
          status: "submitted",
          total_manual_score: 80,
          total_autograding_score: 90,
          title: "Lab 1",
        },
      ]);
    });

    it("should handle session with no submissions", async () => {
      const sessions = [
        {
          id: "session-1",
          users: {
            university_id: "24CSE001",
            name: "John",
            section: "A",
          },
          submissions: [],
          exams: {
            title: "Lab 1",
          },
          status: "allocated",
        },
      ];

      facultyRepo.getSessions.mockResolvedValue(sessions);

      const result = await getSessions();

      expect(result).toEqual([
        {
          session_id: "session-1",
          university_id: "24CSE001",
          name: "John",
          section: "A",
          language: undefined,
          status: "allocated",
          total_manual_score: null,
          total_autograding_score: 0,
          title: "Lab 1",
        },
      ]);
    });
  });
});
