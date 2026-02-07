import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";



//console.log("MONGO_URI:", process.env.MONGO_URI);
dotenv.config();
connectDB();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
