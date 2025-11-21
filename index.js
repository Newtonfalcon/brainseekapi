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
  
];

// CORS configuration - MUST be before other middleware
app.use(cors({
  origin: ["https://brainseek.vercel.app",
  "https://www.brainseek.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));



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


app.post('/api', authMiddleware, async (req, res) => {
  try {
    const { prompt, thread_id } = req.body;

    if (!prompt || !thread_id) {
      return res.status(400).json({ error: "Prompt and Thread ID are required" });
    }

    const data = await agent.invoke(
      { messages: [{ role: "user", content: prompt }] },
      { configurable: { thread_id: thread_id } }
    );

    const response = data.messages?.at(-1)?.content || "No response from agent";

    return res.status(200).json({ message: response });
  } catch (error) {
    console.error("AI endpoint error:", error);

    // Detect auth error vs agent error
    if (error.message?.includes("Unauthorized")) {
      return res.status(401).json({ error: "Unauthorized: invalid token" });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});


app.use('/api/auth', authRoute)
app.use('/api/chat', authMiddleware, chatRouter)
app.use('/api/message', authMiddleware, messageRouter)


// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err)
  res.status(500).json({ 
    error: "Something went wrong",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  })
})