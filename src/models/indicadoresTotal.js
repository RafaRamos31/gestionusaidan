import mongoose from "mongoose";

const schema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
  },
  resultado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resultado",
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  tipoIndicador: {
    type: Number,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  metodoCalculo: {
    type: String,
    required: true,
  },
  metodoRecoleccion: {
    type: String,
    required: true,
  },
  unidadMedida: {
    type: Number,
    required: true,
  },
  totalMeta: {
    type: Number,
    required: true,
  },
  progresoMeta: {
    type: Number,
    required: true,
  },
  fechaInicio: {
    type: String,
    required: true,
  },
  fechaFinal: {
    type: String,
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
export default mongoose.model("IndicadorTotal", schema, "IndicadoresTotal");
