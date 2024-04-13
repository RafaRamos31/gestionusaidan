import { createSector, deleteSector, editSector, getCountSectores, getListSectores, getPagedSectores, getRevisionesSector, getSectorById, revisarUpdateSector } from "../controllers/sectores-controllers.js";
import { createTipoEvento, deleteTipoEvento, editTipoEvento, getCountTiposEventos, getListTiposEventos, getPagedTiposEventos, getRevisionesTipoEvento, getTipoEventoById, revisarUpdateTipoEvento } from "../controllers/tiposEventos-controller.js";

export const getTiposEventosEndpoints = (app, upload) => {

  //GET count
  app.post("/api/count/tiposEventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountTiposEventos({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los tipos de eventos: ' + error });
    }
  })

  //POST Get PAGED 
  app.post("/api/paged/tiposEventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedTiposEventos({
        header: authorizationHeader,
        response,
        page: request.body.page,
        pageSize: request.body.pageSize,
        filter: JSON.parse(request.body.filter),
        sort: JSON.parse(request.body.sort),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los tipos de eventos: ' + error });
    }
  })


  //POST Get List 
  app.post("/api/list/tiposEventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListTiposEventos({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los tipos de eventos: ' + error });
    }
  })


  //GET by Id
  app.get("/api/tipoEvento/:idTipoEvento", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getTipoEventoById(
        authorizationHeader,
        response,
        request.params.idTipoEvento
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el tipo de evento: ' + error });
    }
  })
  

  //GET revisiones 
  app.get("/api/revisiones/tipoEvento/:idTipoEvento", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesTipoEvento(
        authorizationHeader,
        response,
        request.params.idTipoEvento
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del tipo de evento: ' + error });
    }
  })


  //POST 
  app.post("/api/tiposEventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createTipoEvento(
        authorizationHeader,
        response,
        request.body.nombre,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el tipo de evento: ' + error });
    }
  })

  //PUT modificar 
  app.put("/api/tiposEventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editTipoEvento(
        authorizationHeader,
        response,
        request.body.idTipoEvento,
        request.body.nombre,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el tipo de evento: ' + error });
    }
  })

  //PUT revisar 
  app.put("/api/revisiones/tiposEventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateTipoEvento(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el tipo de evento: ' + error });
    }
  })


  //DELETE eliminar 
  app.delete("/api/tiposEventos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteTipoEvento(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el tipo de evento: ' + error });
    }
  })

  return app;
}