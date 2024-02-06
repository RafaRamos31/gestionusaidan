import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  sexo: {
    type: String,
    required: true,
  },
  fechaNacimiento: {
    type: Date
  },
  dni: {
    type: String,
    required: true,
  },
  sector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sector",
    required: true,
  },
  tipoOrganizacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TipoOrganizacion",
    required: true,
  },
  organizacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizacion",
    required: true,
  },
  cargo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cargo",
    required: true,
  },
  telefono: {
    type: String,
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
  geolocacion: {
    type: String
  },
  original: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiario",
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
export default mongoose.model("Beneficiario", schema, "Beneficiarios");
