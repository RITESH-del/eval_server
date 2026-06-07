import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import authConfig from "../../config/auth.config.js";
import * as authRepo from "./auth.repository.js";

const googleClient = new OAuth2Client();

export const signup = async (data) => {
  const existing = await authRepo.findByEmail(data.email);

  if (existing) {
    throw new Error("Email already exists");
  }

  const hash = await bcrypt.hash(data.password, 10);
  const { password, universityId, ...rest } = data;
  const user = await authRepo.create({
    ...rest,
    university_id: universityId,
    password_hash: hash,
  });
  const token = generateToken(user);

  return { token, user };
};

export const login = async ({ email, password }) => {
  const user = await authRepo.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");
  const token = generateToken(user);

  return {
    token,
    user,
  };
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    authConfig.secret,
    {
      expiresIn: authConfig.secret_expires_in,
    },
  );
};

export const googleLogin = async (credential) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
  });

  const payload = ticket.getPayload();
  const email = payload.email;

  let user = await authRepo.findByEmail(email);

  if (!user) {
    user = await authRepo.create({
      email,
      name: payload.name,
      role: "student",
    });
  }

  const accessToken = generateToken(user);

  return {
    user,
    accessToken,
  };
};