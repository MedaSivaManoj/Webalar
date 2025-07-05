let io;

function setupSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}


function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized! Call setupSocket(server) first.");
  }
  return io;
}

module.exports = { setupSocket, getIO };
