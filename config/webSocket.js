module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("connected to", socket.id);

    //Joining room
    socket.on("join_room", (data) => {
      const { shipmentId } = data;
      socket.join(shipmentId);

      socket.on("position", (data) => {
        socket.to(data.shipmentId).emit("driver_position", data);
      });

      socket.on("disconnected", () => {
        console.log("user disconnected", socket.id);
      });
    });
  });
};
