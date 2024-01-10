import { crearTicket, deleteTicket, getAllTickets, getTicketById } from "../controllers/tickets-controller.js";

export const getTicketsEndpoints = (app, upload) => {

  //GET tickets
  app.get("/api/tickets", async (request, response) => {
    try {
      const tickets = await getAllTickets();
      response.json(tickets);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los Tickets de Registro: ' + error });
    }
  })

  //Get Ticket by Id
  app.get("/api/ticket", upload.any(), async (request, response) => {
    try {
      const ticket = await getTicketById(
        request.body.idTicket
      );

      if(!ticket) return response.status(404).send('Ticket no encontrado.');

      response.status(200).json({ticket});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al canjear el ticket: ' + error });
    }
  })

  //POST ticket
  app.post("/api/tickets", upload.any(), async (request, response) => {
    try {
      const ticket = await crearTicket();
      response.json(ticket);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al crear el ticket de registro: ' + error });
    }
  })

  //Delete canjear ticket
  app.delete("/api/tickets", upload.any(), async (request, response) => {
    try {
      const ticket = await deleteTicket(
        request.body.idTicket
      );

      if(!ticket) return response.status(404).send('Ticket no encontrado.');

      response.status(200).json({ticket});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al canjear el ticket: ' + error });
    }
  })

  return app;
}