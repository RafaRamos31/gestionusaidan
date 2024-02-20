import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  tarea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tarea",
    required: true,
  },
  areaTematica: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AreaTematica",
  },
  fechaInicio: {
    type: Date,
    required: true,
  },
  fechaFinal: {
    type: Date,
    required: true,
  },
  departamento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Departamento",
    required: true,
  },
  municipio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Municipio",
    required: true,
  },
  aldea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Aldea",
    required: true,
  },
  caserio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Caserio",
    required: true,
  },
  sectores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sector",
  }],
  nivel: {
    type: String,
    required: true,
  },
  organizador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  responsables: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  }],
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiario",
  }],
  enlaceListado: {
    type: String,
  },
  enlacesFotografias: [{
    type: String,
  }],
  original: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evento",
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
export default mongoose.model("Evento", schema, "Eventos");
