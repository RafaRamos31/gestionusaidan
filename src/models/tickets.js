import mongoose from "mongoose";

const schema = new mongoose.Schema({
  fechaCreacion: {
    type: Date
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
export default mongoose.model("Ticket", schema, "Tickets");
