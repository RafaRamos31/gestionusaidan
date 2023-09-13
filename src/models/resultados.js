import mongoose from "mongoose";

const schema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true,
  },
  fechaInicio: {
    type: String,
    required: true
  },
  fechaFinal: {
    type: String,
    required: true
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
export default mongoose.model("Resultado", schema, "Resultados");
