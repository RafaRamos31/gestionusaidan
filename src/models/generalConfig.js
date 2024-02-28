import mongoose from "mongoose";

const schema = new mongoose.Schema({
  ref: {
    type: Number,
    required: true,
  },
  currentYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
  },
  enableSubirPlanificacion: {
    type: Boolean,
  },
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("GeneralConfig", schema, "GeneralConfigs");
