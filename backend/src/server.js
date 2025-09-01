const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const matchRoutes = require('./routes/match.routes');

// Initialize express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.CLIENT_ORIGIN,
    credentials: true
  }
});

// Store io instance in app for use in routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/matches', matchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Join user room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${socket.id} joined user room: user:${userId}`);
  });

  // Join a bracket room
  socket.on('join-bracket', (bracketId) => {
    socket.join(bracketId);
    console.log(`User ${socket.id} joined bracket: ${bracketId}`);
  });

  // Leave a bracket room
  socket.on('leave-bracket', (bracketId) => {
    socket.leave(bracketId);
    console.log(`User ${socket.id} left bracket: ${bracketId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Client origin: ${config.CLIENT_ORIGIN}`);
  console.log(`Vote limit: ${config.VOTE_LIMIT}`);
});
