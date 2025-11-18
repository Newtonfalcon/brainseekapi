import {Router} from "express";
import { createChat, getChat } from "../controllers/chats.controllers.js";

const chatRouter = Router();

chatRouter.post("/", createChat);
chatRouter.get("/", getChat)

export default chatRouter;