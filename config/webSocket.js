module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log(`${socket.id} connected to backend`);


    
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
