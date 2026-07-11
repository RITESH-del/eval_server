import { jest } from "@jest/globals";

const mockCreateLab = jest.fn();
const mockGetLabs = jest.fn();
const mockGetLabDetails = jest.fn();
const mockGetAllSubmissions = jest.fn();
const mockGetSubmissionById = jest.fn();
const mockYears = jest.fn();
const mockSections = jest.fn();
const mockGetSessions = jest.fn();
const mockFindLabById = jest.fn();
const mockFetchLabById = jest.fn();
const mockUpdateLab = jest.fn();
const mockDeleteLab = jest.fn();

jest.unstable_mockModule("../faculty.repository.js", () => ({
  createLab: mockCreateLab,
  getLabs: mockGetLabs,
  getLabDetails: mockGetLabDetails,
  getAllSubmissions: mockGetAllSubmissions,
  getSubmissionById: mockGetSubmissionById,
  years: mockYears,
  sections: mockSections,
  getSessions: mockGetSessions,
  findLabById: mockFindLabById,
  fetchLabById: mockFetchLabById,
  updateLab: mockUpdateLab,
  deleteLab: mockDeleteLab,
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
  fetchLab,
  updateLab,
  deleteLab,
} = await import("../faculty.service.js");

describe("Faculty Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLab", () => {
    it("should create a lab and return the created exam", async () => {
      const mockExam = { id: "exam-1", title: "Test Lab" };
      facultyRepo.createLab.mockResolvedValue(mockExam);

      const examData = {
        title: "Test Lab",
        total_marks: 100,
        duration_minutes: 60,
        target_graduation_year: 2026,
        target_sections: ["A"],
        start_time: new Date("2026-06-28T14:48:20.000Z"),
        end_time: new Date("2026-06-28T16:48:20.000Z"),
        created_by: "faculty-1",
        questions: [],
      };

      const result = await createLab(examData);

      expect(facultyRepo.createLab).toHaveBeenCalled();
      expect(result).toEqual(mockExam);
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
            graduation_year: 2026,
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
            start_time: new Date("2026-06-28T14:48:20.000Z"),
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
          graduation_year: 2026,
          start_time: sessions[0].exams.start_time,
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
            graduation_year: 2026,
          },
          submissions: [],
          exams: {
            title: "Lab 1",
            start_time: new Date("2026-06-28T14:48:20.000Z"),
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
          graduation_year: 2026,
          start_time: sessions[0].exams.start_time,
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
        target_graduation_year: [2025, 2026, 2027, 2028],
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

  describe("fetchLab", () => {
    it("should fetch a lab by id and map questions and test cases correctly", async () => {
      const mockRepoLab = {
        id: "exam-1",
        title: "Test Lab",
        total_marks: 100,
        start_password_hash: "hashedpass",
        duration_minutes: 60,
        target_graduation_year: 2026,
        start_time: new Date("2026-06-28T14:48:20.000Z"),
        end_time: new Date("2026-06-28T16:48:20.000Z"),
        is_active: true,
        is_live: true,
        exam_target_sections: [{ section: "A" }],
        exam_questions: [
          {
            question_id: "q-1",
            marks_weightage: 20,
            question_bank: {
              title: "Q1",
              description: "desc1",
              difficulty: "easy",
              test_cases: [
                {
                  id: "tc-1",
                  input_data: "1",
                  expected_output: "2",
                  is_hidden: true,
                }
              ]
            }
          }
        ]
      };

      facultyRepo.fetchLabById.mockResolvedValue(mockRepoLab);

      const result = await fetchLab("exam-1");

      expect(facultyRepo.fetchLabById).toHaveBeenCalledWith("exam-1");
      expect(result).toEqual({
        id: "exam-1",
        title: "Test Lab",
        total_marks: 100,
        start_password: "hashedpass",
        duration_minutes: 60,
        target_graduation_year: 2026,
        start_time: mockRepoLab.start_time,
        end_time: mockRepoLab.end_time,
        is_active: true,
        is_live: true,
        target_sections: ["A"],
        questions: [
          {
            id: "q-1",
            type: null,
            title: "Q1",
            statement: "desc1",
            marks: 20,
            difficulty: "easy",
            diagram: null,
            testCases: [
              {
                id: "tc-1",
                input: "1",
                output: "2",
                is_hidden: true
              }
            ]
          }
        ]
      });
    });
  });

  describe("updateLab", () => {
    it("should update a lab if it exists", async () => {
      const mockLab = { id: "exam-1", created_by: "faculty-1" };
      facultyRepo.findLabById.mockResolvedValue(mockLab);
      facultyRepo.updateLab.mockResolvedValue({ id: "exam-1", title: "Updated" });

      const result = await updateLab("exam-1", { title: "Updated" });

      expect(facultyRepo.findLabById).toHaveBeenCalledWith("exam-1");
      expect(facultyRepo.updateLab).toHaveBeenCalledWith("exam-1", { title: "Updated", created_by: "faculty-1" });
      expect(result).toEqual({ id: "exam-1", title: "Updated" });
    });
  });

  describe("deleteLab", () => {
    it("should delete a lab if it exists and belongs to the faculty", async () => {
      const mockLab = { id: "exam-1", created_by: "faculty-1" };
      facultyRepo.findLabById.mockResolvedValue(mockLab);
      facultyRepo.deleteLab.mockResolvedValue();

      await deleteLab("exam-1", "faculty-1");

      expect(facultyRepo.findLabById).toHaveBeenCalledWith("exam-1");
      expect(facultyRepo.deleteLab).toHaveBeenCalledWith("exam-1");
    });
  });
});
