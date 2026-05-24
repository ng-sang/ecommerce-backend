import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Link frontend của bạn
      methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Một User vừa kết nối vào hệ thống: ", socket.id);

    // Khi Admin mở giao diện Dashboard, Frontend sẽ gửi sự kiện này
    socket.on("joinAdminRoom", () => {
      socket.join("admin_room");
      console.log(`Admin (ID: ${socket.id}) đã tham gia phòng nhận thông báo!`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User đã ngắt kết nối: ", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};
