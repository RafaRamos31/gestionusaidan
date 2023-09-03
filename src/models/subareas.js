import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Area",
    required: true,
  },
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("Subarea", schema, "Subareas");
