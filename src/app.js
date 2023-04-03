// generar mi variable __dirname:
import __dirname from "./utils/utils.js";
// importo modulo nativo de Node, path. Para configurar rutas absolutas (por sobre rutas relativas)
import path from "path";
import express from "express";
import { mongoose } from "mongoose";
//necesarios para manejo de sessiones con Atlas
import session from "express-session";
import MongoStore from "connect-mongo";

import { routerCart } from "./routes/cart/cartRoutes.js";
import { router as sessionsRouter } from "./routes/sessions/sessions.router.js";
import { routerProductos } from "./routes/products/productsRoutes.js";
import { routervistas } from "./routes/viewRoutes/vistasRoutes.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";

import { Message } from "./dao/messagesControlador.js";
import passport from "passport";
import { inicializaEstrategias } from "./config/passport.config.js";

const app = express();

app.engine(
  "handlebars",
  engine({ runtimeOptions: { allowProtoPropertiesByDefault: true, allowedProtoMethods: true } })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    secret: "miPalabraSecreta",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl:"mongodb+srv://juligibelli:123Ar456.@cluster0.ysg0sy4.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce",
      ttl: 60,
    }),
  })
);
inicializaEstrategias();
app.use(passport.initialize());
app.use(passport.session());


app.use("/api/products", routerProductos);
app.use("/api/carts", routerCart);

//le indico que todo lo que vaya a / sea renderizado por el router de vistas que llama a la vista home para que muestre el contenido
app.use("/", routervistas);
//lo que vaya a /api/session sera manejado por el ruteador de sessiones -> para Login de usuario.
app.use("/api/sessions", sessionsRouter);



const serverhttp = app.listen(8080, (err) => {
  if (err) {
    throw new Error("super errorrr!!!...");
  } else {
    console.log("Example app listening on port 8080!");
  }
});

//exporto mi servidor websobket
export const serverSocket = new Server(serverhttp);
const mensajes = new Message();



serverSocket.on("connection", (socket) => {
  // console.log(socket.handshake);
  console.log(`Se han conectado, socket id ${socket.id}`);

  socket.emit("hola", {
    emisor: "Servidor",
    mensaje: `Hola, desde el server...!!!`,
    mensajes,
  });

  socket.on("respuestaAlSaludo", (mensaje) => {
    console.log(`${mensaje.emisor} dice ${mensaje.mensaje}`);

    socket.broadcast.emit("nuevoUsuario", mensaje.emisor);
  });

  //aca recibo mensajes desde el front y lo alojo en Atlas
  socket.on("mensaje", (mensaje) => {
    console.log(`${mensaje.emisor} dice ${mensaje.mensaje}`);

    // aca deberia de guardar mis mensajes en la bd
    mensajes.addMessage({ user: mensaje.emisor, message: mensaje.mensaje });

    serverSocket.emit("nuevoMensaje", mensaje);
  });
}); // fin de server.on connection

const conectar = async () => {
  try {
    // acceso a servidor local:
    // await mongoose.connect('mongodb://127.0.0.1:27017/pruebas_mongo')

    await mongoose.connect(
      "mongodb+srv://juligibelli:123Ar456.@cluster0.ysg0sy4.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce"
    );
    console.log(`Conexión a DB establecida`);
  } catch (err) {
    console.log(`Error al conectarse con el servidor de BD: ${err}`);
  }
};

conectar();
