import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { __dirname, createToken, authToken } from "./helpers/utils.js";
import path from "path";
import cookieParser from "cookie-parser";
//import session from "express-session";
//import MongoStore from "connect-mongo";
import passport from "passport";
import { initializePassport } from "./config/passport.config.js";

import productsDBRouter from "./routes/productsDB.router.js";
import cartsDBRouter from "./routes/cartsDB.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionsRouter from "./routes/sessions.router.js";

import productManagerDB from "./dao/productManagerDB.js";
import { messagesModel } from "./dao/models/messages.model.js";

const app = express();
const port = 8080;
const pm = new productManagerDB();
const dbUrl =
  "mongodb+srv://juligibelli:123Ar456.@cluster0.ysg0sy4.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce";

app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

/* app.use(
  session({
    secret: "mySecretKey",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: dbUrl,
      ttl: 60,
    }),
  })
); */

initializePassport();
app.use(passport.initialize());
//app.use(passport.session());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/cartsDB", cartsDBRouter);
app.use("/api/productsDB", productsDBRouter);

const httpServer = app.listen(port, () => {
  console.log(`Server escuchando en puerto: ${port}`);
});

const io = new Server(httpServer);

io.on("connection", async (socket) => {
  console.log("New client connected");

  socket.on("deleteProduct", async (id) => {
    let response = await pm.deleteProductSocket(id);
    socket.emit("deleteProductRes", response);
    if (response.success) {
      socket.broadcast.emit("productListUpdated");
    }
  });

  socket.on("addProduct", async (product) => {
    let response = await pm.addProductSocket(product);
    socket.emit("addProductRes", response);
    if (response.success) {
      socket.broadcast.emit("productListUpdated");
    }
  });

  socket.on("newMessage", async ({ user, message }) => {
    await messagesModel.create({ user: user, message: message });
    io.emit("messagesListUpdated");
  });
});

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Conexion con DB correcta");
  } catch (error) {
    console.log(`Fallo al conectar con DB. Error: ${error}`);
  }
};

connectDB();

io.on("error", (error) => console.error(error));
