import * as userService from "./user.service.js";

export const getUserProfile = async (req, res, next) => {
  try {
    console.log(req.user);
    const user = await userService.getUserProfile(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};