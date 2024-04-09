import { crearEvento, getCountEventos, getEventoById, getKanbanEventos, getPagedEventos } from "../controllers/eventos-controller.js";
import { deleteTarea, editTarea, getListTareas, getRevisionesTarea, getTareaById, revisarUpdateTarea } from "../controllers/tareas-controller.js";

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


  //POST evento
  app.post("/api/eventos", upload.any(), async (request, response) => {
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

  //PUT modificar tarea
  app.put("/api/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editTarea({
        header: authorizationHeader,
        response,
        idTarea: request.body.idTarea,
        idComponente: request.body.idComponente,
        idSubActividad: request.body.idSubActividad,
        nombre: request.body.nombre,
        titulo: request.body.titulo,
        descripcion: request.body.descripcion,
        idYear: request.body.idYear,
        idQuarter: request.body.idQuarter,
        lugar: request.body.lugar,
        unidadMedida: request.body.unidadMedida,
        gastosEstimados: request.body.gastosEstimados,
        cantidadProgramada: request.body.cantidadProgramada,
        aprobar: JSON.parse(request.body.aprobar)
    });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la tarea: ' + error });
    }
  })

  //PUT revisar tarea
  app.put("/api/revisiones/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateTarea(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar la tarea: ' + error });
    }
  })


  //DELETE eliminar resultado
  app.delete("/api/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteTarea(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la tarea: ' + error });
    }
  })

  return app;
}