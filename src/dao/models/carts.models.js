//importo funciones de schema y modelo desde mongoose
import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongoose from "mongoose";
//defino como se llamara mi nueva coleccion
const cartsCollection = "carts";

const cartSchema = new Schema({
  products: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    default: []
  },
});

cartSchema.pre("find", function () {
  this.populate('products.product');
});

cartSchema.plugin(mongoosePaginate);

export const cartsModelo = model(cartsCollection, cartSchema);
