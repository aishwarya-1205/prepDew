require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const { protect } = require("./middlewares/authMiddleware");
const {
  generateInterviewQuestions,
  generateConceptExplanation,
} = require("./controllers/aiController");

const app = express();

//CORS Middleware
app.use(
  cors({
    origin: [
      "https://prep-dew.vercel.app/", // Replace with your actual Vercel URL
      "http://localhost:5173", // Vite default port
      "http://localhost:3000", // Alternative local port
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Important if you're using cookies or auth headers
  })
);

connectDB();

//Middleware
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

// AI Routes (these should be POST routes, not middleware)
app.post("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);

//Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
