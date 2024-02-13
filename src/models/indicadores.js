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
  tipoIndicador: {
    type: String,
    required: true,
  },
  resultados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resultado",
  }],
  frecuencia: {
    type: String,
    required: true,
  },
  medida: {
    type: String,
    required: true,
  },
  metas: {
    type: Object
  },
  progresoMetaLOP: {
    type: Number,
    required: true,
  },
  metaLOP: {
    type: Number,
    required: true,
  },
  actividades: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Actividad",
  }],
  original: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Indicador",
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
export default mongoose.model("Indicador", schema, "Indicadores");
