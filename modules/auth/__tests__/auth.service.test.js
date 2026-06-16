import { jest } from "@jest/globals";

const mockVerifyIdToken = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
    decode: jest.fn(),
  },
}));

jest.unstable_mockModule("../auth.repository.js", () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
}));

jest.unstable_mockModule("google-auth-library", () => ({
  OAuth2Client: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const authRepo = await import("../auth.repository.js");

const {
  signup,
  login,
  googleLogin,
} = await import("../auth.service.js");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create a new user", async () => {
      authRepo.findByEmail.mockResolvedValue(null);

      bcrypt.hash.mockResolvedValue("hashed-password");

      const createdUser = {
        id: 1,
        email: "ritesh.24cse@example.com",
        role: "student",
      };

      authRepo.create.mockResolvedValue(createdUser);

      jwt.sign.mockReturnValue("jwt-token");

      const data = {
        email: "ritesh.24cse@example.com",
        password: "password123",
        universityId: "24CSE001",
        name: "Ritesh",
      };

      const result = await signup(data);

      expect(authRepo.findByEmail)
        .toHaveBeenCalledWith(data.email);

      expect(bcrypt.hash)
        .toHaveBeenCalledWith("password123", 10);

      expect(authRepo.create)
        .toHaveBeenCalledWith({
          email: "ritesh.24cse@example.com",
          role: "student",
          university_id: "24CSE001",
          password_hash: "hashed-password",
          name: "Ritesh",
        });

      expect(jwt.sign).toHaveBeenCalled();

      expect(result).toEqual({
        token: "jwt-token",
        user: createdUser,
      });
    });

    it("should throw when email already exists", async () => {
      authRepo.findByEmail.mockResolvedValue({
        id: 1,
      });

      await expect(
        signup({
          email: "test@test.com",
          password: "password123",
        })
      ).rejects.toThrow("Email already exists");

      expect(authRepo.create)
        .not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const user = {
        id: 1,
        email: "test@test.com",
        role: "student",
        password_hash: "hashed-password",
      };

      authRepo.findByEmail.mockResolvedValue(user);

      bcrypt.compare.mockResolvedValue(true);

      jwt.sign.mockReturnValue("jwt-token");

      jwt.decode.mockReturnValue({
        iat: 100,
        exp: 200,
      });

      const result = await login({
        email: "test@test.com",
        password: "password123",
      });

      expect(authRepo.findByEmail)
        .toHaveBeenCalledWith("test@test.com");

      expect(bcrypt.compare)
        .toHaveBeenCalledWith(
          "password123",
          "hashed-password"
        );

      expect(jwt.sign).toHaveBeenCalled();

      expect(result).toEqual({
        token: "jwt-token",
        user,
      });
    });

    it("should throw if user does not exist", async () => {
      authRepo.findByEmail.mockResolvedValue(null);

      await expect(
        login({
          email: "missing@test.com",
          password: "password123",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw if password is incorrect", async () => {
      authRepo.findByEmail.mockResolvedValue({
        id: 1,
        password_hash: "hashed-password",
      });

      bcrypt.compare.mockResolvedValue(false);

      await expect(
        login({
          email: "test@test.com",
          password: "wrong-password",
        })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("googleLogin", () => {
    it("should login existing google user", async () => {
      const existingUser = {
        id: 1,
        email: "user@gmail.com",
        role: "student",
      };

      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: "user@gmail.com",
          name: "Google User",
        }),
      });

      authRepo.findByEmail.mockResolvedValue(
        existingUser
      );

      jwt.sign.mockReturnValue("google-token");

      const result = await googleLogin(
        "google-credential"
      );

      expect(mockVerifyIdToken)
        .toHaveBeenCalledWith({
          idToken: "google-credential",
        });

      expect(authRepo.findByEmail)
        .toHaveBeenCalledWith("user@gmail.com");

      expect(result).toEqual({
        user: existingUser,
        accessToken: "google-token",
      });
    });

    it("should create new user when google user does not exist", async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: "new@gmail.com",
          name: "New User",
        }),
      });

      authRepo.findByEmail.mockResolvedValue(null);

      const createdUser = {
        id: 2,
        email: "new@gmail.com",
        role: "student",
      };

      authRepo.create.mockResolvedValue(
        createdUser
      );

      jwt.sign.mockReturnValue("google-token");

      const result = await googleLogin(
        "google-credential"
      );

      expect(authRepo.create)
        .toHaveBeenCalledWith({
          email: "new@gmail.com",
          name: "New User",
          role: "student",
        });

      expect(result).toEqual({
        user: createdUser,
        accessToken: "google-token",
      });
    });

    it("should propagate google verification errors", async () => {
      mockVerifyIdToken.mockRejectedValue(
        new Error("Invalid Google token")
      );

      await expect(
        googleLogin("bad-token")
      ).rejects.toThrow("Invalid Google token");
    });
  });
});