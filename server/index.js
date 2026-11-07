
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const workerRoutes = require('./routes/workerRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;



app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/workers', workerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WorkConnect Backend API is active',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('WorkConnect API Server is running smoothly!');
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(`🚀 WorkConnect Server is running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👉 Workers API:  http://localhost:${PORT}/api/workers`);
  console.log(`👉 Auth API:     http://localhost:${PORT}/api/auth`);
  console.log(`👉 AI Chat API:  http://localhost:${PORT}/api/chat/message`);
  console.log(`===============================================`);
});
