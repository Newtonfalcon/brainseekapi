import {Router} from "express";
import {getMessage, postMessage, updateMessage} from "../controllers/message.controllers.js"

const messageRouter = Router();

messageRouter.get("/:id", getMessage)
messageRouter.post("/", postMessage);
messageRouter.patch("/", updateMessage)

export default messageRouter;