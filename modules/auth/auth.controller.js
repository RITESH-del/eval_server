import * as authService from "./auth.service.js";

export const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.validatedData);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.validatedData); //attaching validateData custom property to req

    res.json(result);
  } catch (err) {
      next(err);
    }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    // req.logout(() => {}); // passport removes the user from req.user and req.session
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const result = await authService.googleLogin(req.validatedData.credential);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// export const ssoCallback = async (req, res, next) => {
//   try {
//     await authService.ssoCallback(req.user); //attach user object to req   
//     res.redirect(`${process.env.FRONTEND_URL}/${role}/dashboard`);
//   } catch (err) {
//     next(err);
//   }
// };