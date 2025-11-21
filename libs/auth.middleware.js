import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    // Make sure cookie-parser is used in server.js
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: no auth token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SESSION_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AuthMiddleware Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
