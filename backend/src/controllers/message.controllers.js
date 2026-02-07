import Message from "../models/message.model.js";
import { getIO } from "../socket/socket.js";

export const newMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
      return res.status(500).json({ message: "All fields are required" });
    }

    const message = await Message.create({
      sender,
      receiver,
      text,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    console.log("DECODED USER:", req.user);
    console.log("params" , req.params);
    console.log("body: ",req.body);

    const senderId = req.user.id;      // from JWT
    const receiverId = req.params.userId;
    const { content } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!content) {
      return res.status(400).json({ message: "Message content required" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content,
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};
export const getMessagesBtwTwoUsers = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    if (!sender || !receiver) {
      return res
        .send(400)
        .json({ message: "both sender and receiver are required" });
    }
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const myId = req.user.id;
  const otherUserId = req.params.userId;
  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: otherUserId },
      { sender: otherUserId, receiver: myId },
    ],
  }).sort({ createdAt: 1 });
  res.json(messages);
};
