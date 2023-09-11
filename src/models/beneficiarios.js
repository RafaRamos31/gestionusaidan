import mongoose from "mongoose";

const schema = new mongoose.Schema({
  dni: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true,
  },
  sexo: {
    type: Number,
    required: true,
  },
  fechaNacimiento: {
    type: String
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
  telefono: {
    type: String,
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
  geolocacion: {
    type: String
  },
  ultimaEdicion: {
    type: Date
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("Beneficiario", schema, "Beneficiarios");
