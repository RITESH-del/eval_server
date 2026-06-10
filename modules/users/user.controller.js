import * as userService from "./user.service.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.usedId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};