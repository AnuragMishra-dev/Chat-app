import express from "express";

import { newMessage,getAllMessages,getMessagesBtwTwoUsers,getMessages , sendMessage } from "../controllers/message.controllers.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

router.post("/",newMessage);
router.get("/",getAllMessages);

router.post("/send/:userId", protect,sendMessage);
router.get("/chat/:sender/:receiver",getMessagesBtwTwoUsers);
router.get("/:userId",protect,getMessages);


export default router;