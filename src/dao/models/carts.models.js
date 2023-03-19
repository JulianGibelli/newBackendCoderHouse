//importo funciones de schema y modelo desde mongoose
import { Schema, model } from "mongoose";

//defino como se llamara mi nueva coleccion
const cartsCollection = "carts";

const cartSchema = new Schema({
  products: {
    type: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
        },
      },
    ],
  },
});
cartSchema.pre("find", function () {
  this.populate("products.product");
});
export const cartsModelo = model(cartsCollection, cartSchema);
