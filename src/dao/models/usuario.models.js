import { Schema, model } from "mongoose";

const usuarioColeccion = "usuarios";
const usuarioEsquema = new Schema({
  nombre: String,
  apellido: String,
  email: { type: String, unique: true },
  password: String,
  edad: Number,
  github: Boolean,
  githubProfile: Object,
});

export const usuarioModelo = model(usuarioColeccion, usuarioEsquema);
