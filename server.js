const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    path: '/api/socketio',
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Simple authentication middleware (without database calls for now)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // For now, just extract user info from token without verification
      // In production, you'd verify the JWT token here
      socket.data.userId = 'user_' + Math.random().toString(36).substr(2, 9);
      socket.data.userEmail = 'user@example.com';
      socket.data.userRole = 'USER';
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.userId} connected to socket`);

    // Join user to their personal room for notifications
    socket.join(`user:${socket.data.userId}`);

    // Handle joining chat rooms
    socket.on('join-chat', async (chatId) => {
      try {
        socket.join(`chat:${chatId}`);
        console.log(`User ${socket.data.userId} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${socket.data.userId} left chat ${chatId}`);
    });

    // Handle sending messages (simplified version)
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content } = data;
        
        // Create a mock message object
        const message = {
          id: 'msg_' + Math.random().toString(36).substr(2, 9),
          chatId,
          senderId: socket.data.userId,
          content,
          createdAt: new Date().toISOString(),
          sender: {
            id: socket.data.userId,
            name: 'User',
            email: socket.data.userEmail,
          },
        };

        // Emit message to all users in the chat room
        io.to(`chat:${chatId}`).emit('new-message', message);
        
        console.log(`Message sent in chat ${chatId} by user ${socket.data.userId}: ${content}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.data.userId} disconnected from socket`);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running on /api/socketio`);
    });
});
