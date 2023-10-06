import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import dotenv from "dotenv";
import registerRoutes from "./routes/registerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import zenroomRouter from "./routes/zenroomRouter.js";
import issuerRoutes from './routes/issuerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import {
  checkIfAdmin,
  checkIfPublisher,
  checkIfIssuer,
} from "./middlewares/authMiddleware.js";
import UserModel from "./models/user.js";
import CredentialRequestModel from "./models/CredentialRequest.js";


dotenv.config();
const app = express();
const http = new HTTPServer(app);
const port = process.env.PORT;

app.use(cors({ origin: process.env.CORS }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the moncon API!");
});

app.use("/v1/register", registerRoutes);
app.use("/v1/user", userRoutes);
app.use("/v1/admin", checkIfAdmin, adminRoutes);
app.use("/v1/zenroom", zenroomRouter);
app.use("/v1/issuer", checkIfIssuer, issuerRoutes);

http.listen(port, async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Server started and listening on port ${port}`);
  } catch (err: any) {
    console.log("Error starting server: ", err.message);
  }
});

const io = new Server(http, {
  cors: {
    origin: process.env.CORS,
  },
});

io.on("connection", (socket) => {
  socket.on("initHandshake", async (data) => {
    console.log("initHandshake in app.js");
    console.log(data);
    const userId = data.userId

    try {
      const user = await UserModel.findOne({ id: userId });
      if (!user) {
        await UserModel.create({ id: userId });
      }
    } catch {
      console.log("userId");
      console.log("error creating user");
    }
    socket.join(data.idUser);
    socket.broadcast.to(data.idProvider).emit("handshake", data);
  });

  socket.on("finishHandshake", async (data) => {
    console.log("finishHandshake in app.js");
    console.log(data);
    const idProvider = data.idProvider;
    const issueId = data.issuerId;
    delete data.issuerId;

    const newData = {
      ...data,
      zkp: {
        credentials: "this should be the proof",
        public_key: "this should be the public key of the institution not the therapist",
      }
    }
    socket.join(data.idProvider);
    socket.broadcast.to(data.userId).emit("endHandshake", newData);
  });

  socket.on("login", (data) => {
    console.log("login in app.js");
    console.log("login data: ", data);
    socket.join(data.idUser);
    socket.broadcast.to(data.idProvider).emit("onLogin", data);
  });

  socket.on("notificationMessages", (data) => {
    console.log("notificationMessages in app.js");
    socket.broadcast.to(data.idUser).emit("appNotification", data);
  });

  socket.on("subscribeToCredentialRequestStatus", async (data) => {
    if (!data.userId) {
      return
    }
    socket.join(data.userId);
  });

  socket.on("changedCredentialRequestStatus", async (data) => {
    if (!data.userId) {
      return
    }
    console.log("changedCredentialRequestStatus",data)
    socket.broadcast.to(data.userId).emit("updateCredentialStatus", data);
  });

  socket.on("changeCredentialRequestRecived", async (data) => {
    if (!data._id) {
      return
    }
    console.log("changeCredentialRequestRecived",data)
    const request = await CredentialRequestModel.findById(data._id);
    request.recived = true;
    request.signedCredential = {};
    await request.save();
    console.log('change saved')
  });

  socket.on("disconnect", () => {
    console.log(`disconnect: ${socket.id}`);
  });
});
