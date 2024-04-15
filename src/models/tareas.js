import mongoose from "mongoose";

const schema = new mongoose.Schema({
  componente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Componente",
    required: true,
  },
  resultado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resultado",
    required: true,
  },
  subresultado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubResultado",
    required: true,
  },
  actividad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Actividad",
    required: true,
  },
  subactividad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubActividad",
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
    required: true,
  },
  trimestre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quarter",
    required: true,
  },
  lugar: {
    type: String,
    required: true,
  },
  unidadMedida: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TipoEvento",
    required: true,
  },
  gastosEstimados: {
    type: Number,
    required: true,
  },
  cantidadProgramada: {
    type: Number,
    required: true,
  },
  cantidadRealizada: {
    type: Number
  },
  original: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tarea",
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
export default mongoose.model("Tarea", schema, "Tareas");
