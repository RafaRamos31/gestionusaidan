import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  sector: {
    type: Number,
    required: true,
  },
  areaTematica: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AreaInv",
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
  fecha: {
    type: String,
    required: true,
  },
  monto: {
    type: Number,
    required: true,
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
export default mongoose.model("Inversion", schema, "Inversiones");
