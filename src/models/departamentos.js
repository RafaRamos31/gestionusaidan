import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  geocode: {
    type: String,
    required: true,
    unique: true,
    maxlength: 2,
    minlength: 2
  }
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("Departamento", schema, "Departamentos");
