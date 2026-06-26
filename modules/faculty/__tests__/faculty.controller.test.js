import { jest } from "@jest/globals";

jest.unstable_mockModule("../faculty.service.js", () => ({
  createLab: jest.fn(),
  getLabs: jest.fn(),
  getLabDetails: jest.fn(),
  getAllSubmissions: jest.fn(),
  getSubmissionById: jest.fn(),
  getMetaData: jest.fn(),
  getSessions: jest.fn(),
}));

const facultyService = await import("../faculty.service.js");

const facultyController = await import("../faculty.controller.js");

describe("Faculty Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLab", () => {
    it("should create a lab and return 201", async () => {
      const mockResult = "Exam created successfully";

      facultyService.createLab.mockResolvedValue(mockResult);

      const req = {
        validatedData: {
          title: "Test Lab",
          total_marks: 100,
        },
        user: {
          id: "faculty-id-1",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await facultyController.createLab(req, res, next);

      expect(facultyService.createLab).toHaveBeenCalledWith(
        req.validatedData,
        req.user.id
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when createLab fails", async () => {
      const error = new Error("Create lab failed");

      facultyService.createLab.mockRejectedValue(error);

      const req = {
        validatedData: {},
        user: { id: "faculty-id-1" },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await facultyController.createLab(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getLabs", () => {
    it("should return labs", async () => {
      const mockLabs = [
        { id: "exam-1", title: "Lab 1" },
      ];

      facultyService.getLabs.mockResolvedValue(mockLabs);

      const req = {
        user: { id: "faculty-id-1" },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      await facultyController.getLabs(req, res, next);

      expect(facultyService.getLabs).toHaveBeenCalledWith(
        req.user.id
      );

      expect(res.json).toHaveBeenCalledWith(mockLabs);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when getLabs fails", async () => {
      const error = new Error("Get labs failed");

      facultyService.getLabs.mockRejectedValue(error);

      const req = {
        user: { id: "faculty-id-1" },
      };

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getLabs(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getLabDetails", () => {
    it("should return lab details", async () => {
      const mockDetails = {
        session_id: "session-1",
        title: "Lab 1",
      };

      facultyService.getLabDetails.mockResolvedValue(
        mockDetails
      );

      const req = {
        params: { id: "exam-1" },
      };

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getLabDetails(req, res, next);

      expect(facultyService.getLabDetails).toHaveBeenCalledWith(
        "exam-1"
      );

      expect(res.json).toHaveBeenCalledWith(mockDetails);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when getLabDetails fails", async () => {
      const error = new Error("Get lab details failed");

      facultyService.getLabDetails.mockRejectedValue(error);

      const req = { params: { id: "exam-1" } };

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getLabDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllSubmissions", () => {
    it("should return all submissions for an exam", async () => {
      const mockSubmissions = [
        { id: "session-1", exam_id: "exam-1" },
      ];

      facultyService.getAllSubmissions.mockResolvedValue(
        mockSubmissions
      );

      const req = {
        params: { examId: "exam-1" },
      };

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getAllSubmissions(
        req,
        res,
        next
      );

      expect(
        facultyService.getAllSubmissions
      ).toHaveBeenCalledWith("exam-1");

      expect(res.json).toHaveBeenCalledWith(mockSubmissions);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when getAllSubmissions fails", async () => {
      const error = new Error("Get submissions failed");

      facultyService.getAllSubmissions.mockRejectedValue(
        error
      );

      const req = { params: { examId: "exam-1" } };

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getAllSubmissions(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSubmissionById", () => {
    it("should return a specific submission", async () => {
      const mockSubmission = {
        session_id: "session-1",
        responses: [],
      };

      facultyService.getSubmissionById.mockResolvedValue(
        mockSubmission
      );

      const req = {
        params: {
          examId: "exam-1",
          sessionId: "session-1",
        },
      };

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getSubmissionById(
        req,
        res,
        next
      );

      expect(
        facultyService.getSubmissionById
      ).toHaveBeenCalledWith("exam-1", "session-1");

      expect(res.json).toHaveBeenCalledWith(mockSubmission);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when getSubmissionById fails", async () => {
      const error = new Error("Get submission failed");

      facultyService.getSubmissionById.mockRejectedValue(
        error
      );

      const req = {
        params: {
          examId: "exam-1",
          sessionId: "session-1",
        },
      };

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getSubmissionById(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMetaData", () => {
    it("should return metadata", async () => {
      const mockMetaData = {
        target_graduation_year: [2024, 2025, 2026],
        target_section: ["A", "B"],
      };

      facultyService.getMetaData.mockResolvedValue(
        mockMetaData
      );

      const req = {};

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getMetaData(req, res, next);

      expect(facultyService.getMetaData).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(mockMetaData);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when getMetaData fails", async () => {
      const error = new Error("Get metadata failed");

      facultyService.getMetaData.mockRejectedValue(error);

      const req = {};

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getMetaData(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSessions", () => {
    it("should return all sessions", async () => {
      const mockSessions = [
        {
          session_id: "session-1",
          name: "John",
        },
      ];

      facultyService.getSessions.mockResolvedValue(
        mockSessions
      );

      const req = {};

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getSessions(req, res, next);

      expect(facultyService.getSessions).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(mockSessions);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when getSessions fails", async () => {
      const error = new Error("Get sessions failed");

      facultyService.getSessions.mockRejectedValue(error);

      const req = {};

      const res = { json: jest.fn() };

      const next = jest.fn();

      await facultyController.getSessions(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
