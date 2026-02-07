import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    try {
      // 1️⃣ Get token
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      // 2️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // 3️⃣ Save online user
      onlineUsers.set(userId, socket.id);
      console.log("User online:", userId);

      // 4️⃣ Disconnect cleanup
      socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        console.log("User offline:", userId);
      });

      // 5️⃣ Typing events
      socket.on("typing", ({ receiver }) => {
        const receiverSocketId = onlineUsers.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("typing", { sender: userId });
        }
      });

      socket.on("stopTyping", ({ receiver }) => {
        const receiverSocketId = onlineUsers.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("stopTyping", { sender: userId });
        }
      });

      socket.on("sendMessage", async ({ receiver, content }) => {
  if (!content || !receiver) return;

  // 1️⃣ Save message to DB
  const message = await Message.create({
    sender: userId,
    receiver,
    content,
  });

  // 2️⃣ Check if receiver is online
  const receiverSocketId = onlineUsers.get(receiver);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", {
      _id: message._id,
      sender: userId,
      content,
      createdAt: message.createdAt,
    });
  }

  // 3️⃣ Send confirmation to sender
  socket.emit("messageSent", {
    _id: message._id,
    receiver,
    content,
    createdAt: message.createdAt,
  });
});

    } catch (err) {
      console.log("Socket auth failed");
      socket.disconnect();
    }
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
