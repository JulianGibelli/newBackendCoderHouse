import { cartsModelo } from "./models/carts.models.js";
import { v4 as uuidv4 } from "uuid";

export class Cart {
  constructor() {}

  //unicamente da de alta un nuevo carrito en mi coleccion, le asigna un id (siempre distinto automaticamente) y un products vacio
  async addCart(req, res) {
    let cartCreado = await cartsModelo.create({});

    res.setHeader("Content-Type", "application/json");
    res.status(201).json({
      cartCreado,
    });
  }

  //por medio del id del carrito y el id de producto, se agregara este mismo y su cantidad al carrito
  async addProduct(req, res) {
    res.setHeader("Content-Type", "application/json");
    //toma la cantidad desde el body
    let { quantity } = req.body;
    //busca el carrito segun el ID enviado
    let cart = await cartsModelo.findById(req.params.cid);
    //si encontro el carrito
    if (cart) {
      //recorro sus productos

      let productIndex = cart.products.findIndex((item) => item.product == req.params.pid);
      if (productIndex !== -1) {
        cart.products[productIndex].quantity++;
        await cartsModelo.updateOne({ _id: req.params.cid }, cart);
        // await cartsModelo.updateOne(
        //   { _id: req.params.cid, "products._id": req.params.pid },
        //   { $inc: { "products.$.quantity": quantity } }
        // );
      } else {
        cart.products.push({
          product: req.params.pid,
          quantity: 1,
        });
        await cartsModelo.updateOne({ _id: req.params.cid }, cart);
        // await cartsModelo.updateOne(
        //   { _id: req.params.cid },
        //   { $push: { products: { _id: req.params.pid, quantity: quantity } } }
        // );
      }
      return res.status(201).json({ message: "Product added successfully" });
    } else {
      return res.status(400).json({ error: "Cart not found." });
    }
  }
  async deleteCart(req, res) {
    let cartId = req.params.cid;

    let cartsModificado = await cartsModelo.deleteOne({ _id: cartId });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      cartsModificado,
    });
  }

  async deleteProduct(req, res) {
    let carrito;
    let cartId = req.params.cid;
    let productId = req.params.pid;

    try {
      //voy a buscarlo a mi DB por ese id, si no lo encuentro arroja error
      carrito = await cartsModelo.findById(cartId);
      console.log(carrito);
      if (carrito) {
        //recorro sus productos
        let productIndex = carrito.products.findIndex((item) => item._id.toString() == productId);
        if (productIndex !== -1) {
          //encontre el producto para eliminar
          await cartsModelo.updateOne(
            { _id: req.params.cid },
            { $pull: { products: { _id: productId } } }
          );
        } else {
          //mandaron otro id y no se encontro
          return res.status(400).json({ error: "Producto no encontrado" });
        }
        return res.status(201).json({ message: "Producto eliminado correctamente..." });
      } else {
        return res.status(400).json({ error: "Carrito no encontrado" });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        mensaje: `Error: no se encontro el carrito con ID: ${cartId} en la DB`,
      });
    }
  }

  async getCartsByCid(req, res) {
    let cid = req.params.cid;
    try {
      let cartDB = await cartsModelo.findById(cid).populate("products.product");
      if (cartDB) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({
          ok: true,
          cart: cartDB,
        });
      } else {
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          ok: false,
          msg: `Cannot find the cart with id ${cid}`,
        });
      }
    } catch (error) {
      console.log(error);
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        msg: "Cannot connect with database",
      });
    }
  }
}
