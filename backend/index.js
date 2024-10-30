const { Server } = require("socket.io");

const PORT = process.env.PORT || 8000; 

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const nameToSocketId = new Map();
const socketidToName = new Map();
const roomUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    const { name, roomCode: room } = data;
    nameToSocketId.set(name, socket.id);
    socketidToName.set(socket.id, name);
    // Initialize room if it doesn't exist
    if (!roomUsers.has(room)) {
      roomUsers.set(room, []);
    }
    
    // Add user to room
    roomUsers.get(room).push({
      id: socket.id,
      name: name
    });
    
    // Emit to all users in room including new user
    io.to(room).emit("room:users", roomUsers.get(room));
    io.to(room).emit("user:joined", { name, id: socket.id });
    socket.join(room);
    io.to(room).emit("join_room", data);
  });

  socket.on("call:user", ({ to, offer }) => {  
    io.to(to).emit("incoming:call", { from: socket.id, offer }); 
  });

  socket.on("call:accepted", ({to, ans}) => {
    io.to(to).emit("incoming:call", { from: socket.id, ans }); 
  })

  socket.on("peer:nego:needed", ({ offer, to}) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  })

  socket.on("peer:nego:done", ({to, ans}) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  })

  socket.on("disconnect", () => {
    roomUsers.forEach((users, room) => {
      const index = users.findIndex((user) => user.id === socket.id);
      if (index !== -1) {
        users.splice(index, 1);
        io.to(room).emit("room:users", users);
      }
    });
  });

});
