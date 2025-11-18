import {Router} from "express"
import { login, register, logout, getUser } from "../controllers/auth.controllers.js"
import { authMiddleware } from "../libs/auth.middleware.js"

const authRoute = Router()

authRoute.post('/register', register)
authRoute.post("/login", login)
authRoute.post("/logout", logout)
authRoute.get("/user", authMiddleware,getUser)

export default authRoute