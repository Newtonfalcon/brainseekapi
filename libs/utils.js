import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

export function setToken(userid, res) {
  const token = jwt.sign({ id: userid }, process.env.SESSION_SECRET, { expiresIn: "7d" });
  const isProduction = process.env.NODE_ENV === "production";
  
  const cookieOptions = {
    httpOnly: true,
    secure: true, 
    sameSite: "none", 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };

  
 
  
  res.cookie("token", token, cookieOptions);
}