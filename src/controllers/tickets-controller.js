import Ticket from "../models/tickets.js";

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

export async function crearTicket(){
  const ticket = new Ticket({
    fechaCreacion: new Date(),
  })

  return ticket.save();
}

export async function deleteTicket(idTicket){
  const ticket = await getTicketById(idTicket);
  if(!ticket) return null;

  return ticket.delete();
}