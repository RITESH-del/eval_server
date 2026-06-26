import { jest } from "@jest/globals";

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule("../../../db.js", () => ({
  default: {
    users: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

const mockUUID = "test-uuid-123";

jest.unstable_mockModule("crypto", () => ({
  randomUUID: jest.fn(() => mockUUID),
}));

const authRepo = await import("../auth.repository.js");

describe("Auth Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should call prisma.findUnique with email", async () => {
      const user = {
        id: "1",
        email: "test@test.com",
      };

      mockFindUnique.mockResolvedValue(user);

      const result =
        await authRepo.findByEmail("test@test.com");

      expect(mockFindUnique)
        .toHaveBeenCalledWith({
          where: {
            email: "test@test.com",
          },
        });

      expect(result).toEqual(user);
    });

    it("should return null when user does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result =
        await authRepo.findByEmail("missing@test.com");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a user with generated uuid", async () => {
      const userData = {
        email: "test@test.com",
        role: "student",
      };

      const createdUser = {
        id: mockUUID,
        ...userData,
      };

      mockCreate.mockResolvedValue(createdUser);

      const result =
        await authRepo.create(userData);

      expect(mockCreate)
        .toHaveBeenCalledWith({
          data: {
            id: mockUUID,
            email: "test@test.com",
            role: "student",
          },
        });

      expect(result).toEqual(createdUser);
    });
  });
});