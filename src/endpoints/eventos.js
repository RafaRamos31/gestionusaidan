import { crearEvento, editEventoCrear, getCountEventos, getEventoById, getKanbanEventos, getPagedEventos, revisarEventoCreacionComp, revisarEventoCreacionMEL } from "../controllers/eventos-controller.js";

export const getEventosEndpoints = (app, upload) => {

  //GET count
  app.post("/api/count/eventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountEventos({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        eventComponente: request.body.eventComponente,
        eventCrear: JSON.parse(request.body.eventCrear),
        eventCrearMEL: JSON.parse(request.body.eventCrearMEL),
        eventTerminar: JSON.parse(request.body.eventTerminar),
        eventDigitar: JSON.parse(request.body.eventDigitar),
        eventPresupuestar: JSON.parse(request.body.eventPresupuestar),
        eventConsolidar: JSON.parse(request.body.eventConsolidar),
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los eventos: ' + error });
    }
  })

  //POST Get PAGED
  app.post("/api/paged/eventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedEventos({
        header: authorizationHeader,
        response,
        page: request.body.page,
        pageSize: request.body.pageSize,
        filter: JSON.parse(request.body.filter),
        sort: JSON.parse(request.body.sort),
        eventComponente: request.body.eventComponente,
        eventCrear: JSON.parse(request.body.eventCrear),
        eventCrearMEL: JSON.parse(request.body.eventCrearMEL),
        eventTerminar: JSON.parse(request.body.eventTerminar),
        eventDigitar: JSON.parse(request.body.eventDigitar),
        eventPresupuestar: JSON.parse(request.body.eventPresupuestar),
        eventConsolidar: JSON.parse(request.body.eventConsolidar),
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los eventos: ' + error });
    }
  })

   //POST Get Kanban
  app.post("/api/kanban/eventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getKanbanEventos({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter),
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los eventos: ' + error });
    }
  })

  //GET evento by Id
  app.get("/api/evento/:idEvento", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getEventoById(
        authorizationHeader,
        response,
        request.params.idEvento
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el evento: ' + error });
    }
  })


  //POST evento crear
  app.post("/api/eventos/crear", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await crearEvento({
        header: authorizationHeader,
        response,
        idTarea: request.body.idTarea,
        nombre: request.body.nombre,
        idAreaTematica: request.body.idAreaTematica,
        baseFechaInicio: request.body.fechaInicio,
        baseFechaFinal: request.body.fechaFinal,
        idDepartamento: request.body.idDepartamento,
        idMunicipio: request.body.idMunicipio,
        idAldea: request.body.idAldea,
        idCaserio: request.body.idCaserio,
        idOrganizador: request.body.idOrganizador,
        componentes: JSON.parse(request.body.componentes)?.data,
        colaboradores: JSON.parse(request.body.colaboradores)?.data,
        aprobarComponente: JSON.parse(request.body.aprobarComponente)
    });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el Evento: ' + error });
    }
  })

  //PUT modificar evento crear
  app.put("/api/eventos/crear", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editEventoCrear({
        header: authorizationHeader,
        response,
        idEvento: request.body.idEvento, 
        idTarea: request.body.idTarea,
        nombre: request.body.nombre,
        idAreaTematica: request.body.idAreaTematica,
        baseFechaInicio: request.body.fechaInicio,
        baseFechaFinal: request.body.fechaFinal,
        idDepartamento: request.body.idDepartamento,
        idMunicipio: request.body.idMunicipio,
        idAldea: request.body.idAldea,
        idCaserio: request.body.idCaserio,
        idOrganizador: request.body.idOrganizador,
        componentes: JSON.parse(request.body.componentes)?.data,
        colaboradores: JSON.parse(request.body.colaboradores)?.data,
        aprobarComponente: JSON.parse(request.body.aprobarComponente)
    });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el evento: ' + error });
    }
  })

  //PUT revisar evento comp
  app.put("/api/revisiones/eventos/crear/componente", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarEventoCreacionComp(
        authorizationHeader,
        response,
        request.body.id,
        request.body.aprobado,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el evento: ' + error });
    }
  })


  //PUT revisar evento MEL
  app.put("/api/revisiones/eventos/crear/mel", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarEventoCreacionMEL(
        authorizationHeader,
        response,
        request.body.id,
        request.body.aprobado,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el evento: ' + error });
    }
  })

  return app;
}