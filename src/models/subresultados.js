import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  resultado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resultado",
  },
  original: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubResultado",
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
export default mongoose.model("SubResultado", schema, "SubResultados");
