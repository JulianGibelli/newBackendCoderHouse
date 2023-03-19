import { productsModelo } from "./models/products.models.js";
import { v4 as uuidv4 } from "uuid";

export class Product {
  constructor() {}

  //agregar un producto, valida por code
  async addProduct(req, res) {
    let objAgregar;

    let { title, description, code, price, status = true, stock, category, thumbnail } = req.body;

    //valido que los campos obtenidos desde el body existan
    if (!title || !description || !code || !stock || !category || !price || !status) {
      return res.status(400).send(`<h2>Los campos no pueden estar vacios</h2>`);
    } else {
      objAgregar = {
        title: title,
        description: description,
        code: code,
        price: parseInt(price),
        status: status,
        stock: parseInt(stock),
        category: category,
        thumbnail: thumbnail || [],
        id: uuidv4(),
      };
    }

    let productoExistente = await productsModelo.find({
      code: { $eq: `${objAgregar.code}` },
    });

    if (productoExistente.length >= 1) {
      return res
        .status(400)
        .send(`<h2>El producto con code: ${objAgregar.code} ya existe en la DB</h2>`);
    } else {
      let productoCreado = await productsModelo.create(objAgregar);

      res.setHeader("Content-Type", "application/json");
      res.status(201).json({
        productoCreado,
      });
    }
  }

  //devuelve todos los productos
  async getProducts(req, res) {
    let productos;
    let { limit, page, sort } = req.query;
    let { filter } = req.body;

    try {
      if (filter) {
        const arr = filter.split(":");
        const obj = { [arr[0]]: arr[1].replace(/"/g, "").trim() };
        productos = await productsModelo.paginate(obj, {
          limit: limit ?? 10,
          page: page ?? 1,
          sort: sort ?? { price: -1 },
        });
      } else {
        productos = await productsModelo.paginate({}, {
          limit: limit ?? 10,
          page: page ?? 1,
          sort: sort ?? { price: 1 },
        });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        mensaje: `Error al obtener productos de la DB`,
      });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      productos,
    });
  }

  //devuelve un unico producto, filtrado por _id
  async getProduct(req, res) {
    let idParam = req.params.pid;
    let producto;
    try {
      producto = await productsModelo.find({ _id: { $eq: `${idParam}` } });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        mensaje: `Error al obtener productos de la DB`,
      });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      producto,
    });
  }

  //modifico un producto filtrado por _id
  async modifyProduct(req, res) {
    //tomo el id del producto
    let idParam = req.params.pid;
    let producto;
    try {
      //voy a buscarlo a mi DB por ese id, si no lo encuentro arroja error
      producto = await productsModelo.find({ _id: { $eq: `${idParam}` } });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        mensaje: `Error al obtener productos de la DB`,
      });
    }
    //hago destructuring de todo lo que se que puede llegar a existir en el body enviado
    let { title, description, code, price, status = true, stock, category, thumbnail } = req.body;

    title && (producto[0]["title"] = title);
    description && (producto[0]["description"] = description);
    code && (producto[0]["code"] = code);
    price && (producto[0]["price"] = price);
    status && (producto[0]["status"] = status);
    stock && (producto[0]["stock"] = stock);
    category && (producto[0]["category"] = category);
    thumbnail && (producto[0]["thumbnail"] = thumbnail);

    let productoModificado = await productsModelo.updateOne(
      { _id: { $eq: `${idParam}` } },
      producto[0]
    );

    res.setHeader("Content-Type", "application/json");
    res.status(201).json({
      productoModificado,
    });
  }

  //elimino un producto filtrado por _id
  async deleteProduct(req, res) {
    let producto;
    //tomo el id del producto
    let idParam = req.params.pid;
    try {
      //voy a buscarlo a mi DB por ese id, si no lo encuentro arroja error
      producto = await productsModelo.find({ _id: { $eq: `${idParam}` } });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      console.log(error);
      return res.status(500).json({
        mensaje: `Error al obtener productos de la DB`,
      });
    }

    let productoModificado = await productsModelo.deleteOne({ _id: { $eq: `${idParam}` } });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      productoModificado,
    });
  }
}
