import { Router } from "express";
import * as fs from "fs";
import { lecturaArchivo, escrituraArchivo } from "../../utils/utils.js";
import { serverSocket } from "../../app.js";
import { cartsModelo } from "../../dao/models/carts.models.js";
import mongoose from "mongoose";

const routervistas = Router();
const archivoURL = "./src/productos.json";

//lectura de archivo, obtengo el contenido, copio a un nuevo array y aplano para obtener el contenido de los products
//let arayprueba = [...await lecturaArchivo(archivoURL)].map((item) => item.products).flat();

let arayprueba = await lecturaArchivo(archivoURL);

async function deleteProductSocket(id) {
  let productos = await lecturaArchivo(archivoURL);
  let products = productos.map((item) => item.products).flat();
  let productIndex = products.findIndex((product) => product.id === id);
  let productExists = productIndex !== -1;
  if (productExists) {
    products.splice(productIndex, 1);
    await escrituraArchivo(archivoURL, JSON.stringify(products, null, 2));
    return "Mensaje: Producti eliminado correctamente";
  } else {
    return "Error: Producto no encontrado";
  }
}

routervistas.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).render("home", { arayprueba });
});

//cuando el cliente va a la ruta /realtimeproducts
routervistas.get("/realtimeproducts", (req, res) => {
  //LE INDICO QUE RENDERICE LA VISTA REALTIMEPRODUCTS
  res.setHeader("Content-Type", "text/html");
  res.render("realTimeProducts");
});

routervistas.get("/chat", (req, res) => {
  //LE INDICO QUE RENDERICE LA VISTA REALTIMEPRODUCTS
  res.setHeader("Content-Type", "text/html");
  res.render("chat");
});

routervistas.get("/carts/:cid", async (req, res) => {
  /* let cid = req.params.cid;
  try {
    
    let cartDB = await cartsModelo.find({ _id: { $eq: cid } });

    console.log("soy cartDB", cartDB[0]["products"]);
    if (cartDB.length) {
      //res.setHeader("Content-Type", "text/html");
      res.render("cart", { cartDB: cartDB[0]["products"], cid });
    } else {
      res.setHeader("Content-Type", "text/html");
      res.sendStatus(400);
    }
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "text/html");
    res.sendStatus(500);
  } */ let cid = req.params.cid;

  try {
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      res.setHeader("Content-Type", "text/html");

      res.sendStatus(400);
    } else {
      let cartDB = await cartsModelo.find({ _id: { $eq: cid } });

      console.log("soy cartDB", cartDB[0]["products"]);

      if (cartDB.length) {
        res.render("cart", { cartDB: cartDB[0]["products"], cid });
      } else {
        res.setHeader("Content-Type", "text/html");

        res.sendStatus(400);
      }
    }
  } catch (error) {
    console.log(error);

    res.setHeader("Content-Type", "text/html");

    res.sendStatus(500);
  }
});

export { routervistas };
