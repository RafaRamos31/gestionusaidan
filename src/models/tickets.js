import mongoose from "mongoose";

const schema = new mongoose.Schema({
  fechaCreacion: {
    type: Date
  }
});

/**
 * Modelo de entidad de un Componente
 */
export default mongoose.model("Ticket", schema, "Tickets");
