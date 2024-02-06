import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  dni: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  componente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Componente",
    required: true,
  },
  rol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rol",
  },
  correo: {
    type: String
  },
  password: {
    type: String
  },
  original: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
  version: {
    type: String,
  },
  ultimaRevision: {
    type: String,
  },
  estado: {
    type: String,
  },
  fechaEdicion: {
    type: Date
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
  fechaRevision: {
    type: Date
  },
  revisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
  fechaEliminacion: {
    type: Date
  },
  eliminador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
  observaciones: {
    type: String,
  },
  pendientes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  }]
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("Usuario", schema, "Usuarios");
