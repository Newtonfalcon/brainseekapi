import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/user.model.js"
dotenv.config()

export const authMiddleware = async (req, res, next) => {
      const token = req.cookies.token

      try {
            if(!token){
                  return res.status(401).json({message: "unauthorized, no auth token"})
            }

            const decoded = jwt.verify(token, process.env.SESSION_SECRET)
            if(!decoded){
                  return res.status(401).json({message: "unauthorized, invalid token"})
            }

            const user = await User.findById(decoded.id).select("-password")
            if(!user){
                  return res.status(404).json({message: "unauthorized, user not found"})
            }

            req.user = user
            next()

      } catch (error) {
            return res.status(500).json({message: error.message})
      }
}