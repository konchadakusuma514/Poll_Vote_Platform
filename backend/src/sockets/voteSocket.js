const setupVoteSocket = (io) => {
  io.on("connection", (socket) => {
    // Join specific poll room to listen for live vote updates
    socket.on("join_poll", (pollId) => {
      socket.join(`poll_${pollId}`);
    });

    socket.on("leave_poll", (pollId) => {
      socket.leave(`poll_${pollId}`);
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });
};

module.exports = setupVoteSocket;
