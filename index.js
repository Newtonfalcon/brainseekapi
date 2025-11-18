import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { agent } from "./research.js"
import { connectDb } from "./libs/connectDb.js"
import authRoute from "./routes/auth.route.js"
import chatRouter from "./routes/chat.route.js"
import { authMiddleware } from "./libs/auth.middleware.js"
import messageRouter from "./routes/message.route.js"
dotenv.config()



const app = express()
const CLIENT_URL =  "http://10.81.16.249:5173/"



app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}))
app.use(express.json())
app.use(cookieParser())



const port = process.env.PORT || 7116

connectDb()
app.listen(port, ()=>{

})



app.use('/api/auth', authRoute)
app.use('/api/chat',authMiddleware, chatRouter)
app.use('/api/message',authMiddleware, messageRouter)

app.post('/api', authMiddleware, async (req, res)=>{


      try {

            const {prompt, thread_id} = req.body
            const data = await agent.invoke({
                   messages: [
                  {
                  role:"user",
                  content:prompt
                        }
      ]
}, {
      configurable: {thread_id:thread_id}
})



      return res.status(201).json(data.messages.at(-1)?.content || "No response from agent")
            
      } catch (error) {
            res.status(500).json({error: error.message})
            
      }
     

})

