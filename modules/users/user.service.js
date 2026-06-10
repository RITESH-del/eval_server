import * as userRepo from "./user.repository.js";

// later might need to add profile or other information
export const getUserProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  return user;
};