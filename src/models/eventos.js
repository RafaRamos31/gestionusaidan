import mongoose from "mongoose";

const schema = new mongoose.Schema({
  tarea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tarea",
    required: true,
  },
  nombre: {
    type: String,
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
  organizador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  componentes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Componente",
  }],
  colaboradores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  }],
  estadoPlanificacionMEL: {
    type: String,
    required: true,
  },
  observacionesPlanificacionMEL: {
    type: String,
  },
  fechaRevisionMEL: {
    type: Date,
  },
  estadoPlanificacionComponente: {
    type: String,
    required: true,
  },
  observacionesPlanificacionComponente: {
    type: String,
  },
  fechaRevisionComponente: {
    type: Date,
  },
  numeroFormulario: {
    type: String,
  },
  participantesHombres: {
    type: Number,
  },
  participantesMujeres: {
    type: Number,
  },
  participantesComunitarios: {
    type: Number,
  },
  participantesInstitucionales: {
    type: Number,
  },
  totalDias: {
    type: Number,
  },
  totalHoras: {
    type: Number,
  },
  sectores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sector",
  }],
  nivel: {
    type: String,
  },
  logros: {
    type: String,
  },
  compromisos: {
    type: String,
  },
  enlaceFormulario: {
    type: String,
  },
  enlaceFotografias: {
    type: String,
  },
  estadoRealizacion: {
    type: String,
  },
  observacionesRealizacion: {
    type: String,
  },
  fechaRevisionRealizacion: {
    type: Date,
  },
  totalPresupuesto: {
    type: Number,
  },
  enlacePresupuesto: {
    type: String,
  },
  estadoPresupuesto: {
    type: String,
  },
  fechaPresupuesto: {
    type: Date,
  },
  participantes: {
    type: Array
  },
  estadoDigitacion: {
    type: String,
  },
  fechaDigitacion: {
    type: Date,
  },
  observacionesDigitacion: {
    type: String,
  },
  fechaRevisionDigitacion: {
    type: Date,
  },
  totalIndicadores: {
    type: Object,
  },
  estadoConsolidado: {
    type: String,
  },
  fechaConsolidado: {
    type: Date,
  },
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("Evento", schema, "Eventos");
