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
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"

const allowedOrigins = [
  "https://brainseek.vercel.app",
  "https://www.brainseek.vercel.app",
  "http://localhost:5173"
];

// CORS configuration - MUST be before other middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight
app.options("*", cors());

app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 7116

connectDb()

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.use('/api/auth', authRoute)
app.use('/api/chat', authMiddleware, chatRouter)
app.use('/api/message', authMiddleware, messageRouter)

app.post('/api', authMiddleware, async (req, res) => {
  try {
    const { prompt, thread_id } = req.body

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    if (!thread_id) {
      return res.status(400).json({ error: "Thread ID is required" })
    }

    const data = await agent.invoke({
      messages: [{
        role: "user",
        content: prompt
      }]
    }, {
      configurable: { thread_id: thread_id }
    })

    const response = data.messages.at(-1)?.content || "No response from agent"
    
    return res.status(200).json(response)
  } catch (error) {
    console.error("AI endpoint error:", error)
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    })
  }
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err)
  res.status(500).json({ 
    error: "Something went wrong",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  })
})