import Ticket from "../models/tickets.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllTickets(){
  return Ticket.find();
}

export async function getTicketById(idTicket){
  try {
    const ticket = await Ticket.findById(idTicket);
    return ticket;
  } catch (error) {
    throw error;
  }
}

export async function crearTicket(idUsuario=null){
  const editor = await getUsuarioById(idUsuario);
  const ticket = new Ticket({
    fechaCreacion: new Date(),
    ultimaEdicion: new Date(),
    editor
  })

  return ticket.save();
}

export async function deleteTicket(idTicket){
  const ticket = await getTicketById(idTicket);
  if(!ticket) return null;

  return ticket.delete();
}