import jwt from "jsonwebtoken";
import User from '../model/user.js'
import { createError } from "./error.js";

export const verifyToken = async (req, res, next) => {
  const user = await User.findById(req.params.Id)
  const token = user.token
  console.log(user)

  if (!token) return next(createError(401, "You are not authenticated"));

  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) {
      return next(createError(403, "Token not valid"));
    }
    req.user = user
    next();
  });
};

export const checkUser = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      return next(createError(403, "You are Not authorised"));
    }
  });
};
