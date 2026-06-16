import { jest } from "@jest/globals";

jest.unstable_mockModule("../auth.service.js", () => ({
  signup: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  googleLogin: jest.fn(),
  ssoCallback: jest.fn(),
}));

const authService = await import("../auth.service.js");

const authController = await import("../auth.controller.js");

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create a user and return 201", async () => {
      const mockResult = {
        message: "User created successfully",
        user: {
          id: 1,
          email: "test@example.com",
        },
      };

      authService.signup.mockResolvedValue(mockResult);

      const req = {
        validatedData: {
          email: "test@example.com",
          password: "password123",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.signup(req, res, next);

      expect(authService.signup)
        .toHaveBeenCalledWith(req.validatedData);

      expect(res.status)
        .toHaveBeenCalledWith(201);

      expect(res.json)
        .toHaveBeenCalledWith(mockResult);

      expect(next)
        .not.toHaveBeenCalled();
    });

    it("should call next when signup fails", async () => {
      const error = new Error("Signup failed");

      authService.signup.mockRejectedValue(error);

      const req = {
        validatedData: {},
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.signup(req, res, next);

      expect(next)
        .toHaveBeenCalledWith(error);
    });
  });

  describe("login", () => {
    it("should login user and return token", async () => {
      const mockResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      authService.login.mockResolvedValue(mockResult);

      const req = {
        validatedData: {
          email: "test@example.com",
          password: "password123",
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.login(req, res, next);

      expect(authService.login)
        .toHaveBeenCalledWith(req.validatedData);

      expect(res.json)
        .toHaveBeenCalledWith(mockResult);

      expect(next)
        .not.toHaveBeenCalled();
    });

    it("should call next when login fails", async () => {
      const error = new Error("Login failed");

      authService.login.mockRejectedValue(error);

      const req = {
        validatedData: {},
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.login(req, res, next);

      expect(next)
        .toHaveBeenCalledWith(error);
    });
  });

  describe("logout", () => {
    it("should clear token cookie and return success message", async () => {
      const req = {};

      const res = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.logout(req, res, next);

      expect(res.clearCookie)
        .toHaveBeenCalledWith("token");

      expect(res.json)
        .toHaveBeenCalledWith({
          message: "Logged out successfully",
        });

      expect(next)
        .not.toHaveBeenCalled();
    });

    it("should call next when logout fails", async () => {
      const error = new Error("Logout failed");

      const req = {};

      const res = {
        clearCookie: jest.fn(() => {
          throw error;
        }),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.logout(req, res, next);

      expect(next)
        .toHaveBeenCalledWith(error);
    });
  });

  describe("googleLogin", () => {
    it("should login using google credential", async () => {
      const mockResult = {
        accessToken: "jwt-token",
      };

      authService.googleLogin.mockResolvedValue(mockResult);

      const req = {
        validatedData: {
          credential: "google-credential-token",
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.googleLogin(req, res, next);

      expect(authService.googleLogin)
        .toHaveBeenCalledWith(
          "google-credential-token"
        );

      expect(res.json)
        .toHaveBeenCalledWith(mockResult);

      expect(next)
        .not.toHaveBeenCalled();
    });

    it("should call next when google login fails", async () => {
      const error = new Error("Google login failed");

      authService.googleLogin.mockRejectedValue(error);

      const req = {
        validatedData: {
          credential: "token",
        },
      };

      const res = {
        json: jest.fn(),
      };

      const next = jest.fn();

      await authController.googleLogin(req, res, next);

      expect(next)
        .toHaveBeenCalledWith(error);
    });
  });
});