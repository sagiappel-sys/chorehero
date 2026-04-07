const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Allowed origins — add any domain that should talk to this API
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://leanovationtech.com",
  "https://www.leanovationtech.com",
].filter(Boolean);

// Socket.io for real-time updates
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Attach io to every request so controllers can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chores", require("./routes/chores"));
app.use("/api/households", require("./routes/households"));
app.use("/api/notifications", require("./routes/notifications"));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// Socket.io — join household room on connect
io.on("connection", (socket) => {
  socket.on("join:household", (householdId) => {
    socket.join(householdId);
    console.log(`🔌 Socket ${socket.id} joined household room: ${householdId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
