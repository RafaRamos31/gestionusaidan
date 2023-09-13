import mongoose from "mongoose";

const schema = new mongoose.Schema({
  indicadorTotal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IndicadorTotal",
    required: true,
  },
  indicadorYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IndicadorYear",
    required: true,
  },
  periodo: {
    type: String,
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
export default mongoose.model("IndicadorPeriodo", schema, "IndicadoresPeriodo");
