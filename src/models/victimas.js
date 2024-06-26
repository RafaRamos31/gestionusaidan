import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
  },
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("Victima", schema, "Victimas");
