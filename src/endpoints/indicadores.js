import { createIndicador, deleteIndicador, editIndicador, getCountIndicadores, getIndicadorById, getListIndicadores, getPagedIndicadores, getRevisionesIndicadores, revisarUpdateIndicador } from "../controllers/indicadores-controller.js";

export const getIndicadoresEndpoints = (app, upload) => {

  //GET count subresultados
  app.post("/api/count/indicadores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountIndicadores({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los indicadores: ' + error });
    }
  })

  //POST Get PAGED actividades
  app.post("/api/paged/indicadores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedIndicadores({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los indicadores: ' + error });
    }
  })


  //POST Get List 
  app.post("/api/list/indicadores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListIndicadores({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los indicadores: ' + error });
    }
  })


  //GET by Id
  app.get("/api/indicador/:idIndicador", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getIndicadorById(
        authorizationHeader,
        response,
        request.params.idIndicador
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener indicador: ' + error });
    }
  })
  

  //GET revisiones 
  app.get("/api/revisiones/indicador/:idIndicador", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesIndicadores(
        authorizationHeader,
        response,
        request.params.idIndicador
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del indicador: ' + error });
    }
  })


  //POST 
  app.post("/api/indicadores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createIndicador({
        header: authorizationHeader,
        response: response,
        nombre: request.body.nombre,
        descripcion: request.body.descripcion,
        medida: request.body.medida,
        tipoIndicador: request.body.tipoIndicador,
        frecuencia: request.body.frecuencia,
        metas: JSON.parse(request.body.metas),
        aprobar: JSON.parse(request.body.aprobar)
    });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el indicador: ' + error });
    }
  })

  //PUT modificar 
  app.put("/api/indicadores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editIndicador({
        header: authorizationHeader,
        response: response,
        idIndicador: request.body.idIndicador,
        nombre: request.body.nombre,
        descripcion: request.body.descripcion,
        medida: request.body.medida,
        tipoIndicador: request.body.tipoIndicador,
        frecuencia: request.body.frecuencia,
        metas: JSON.parse(request.body.metas),
        progresos: JSON.parse(request.body.progresos),
        aprobar: JSON.parse(request.body.aprobar)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el indicador: ' + error });
    }
  })

  //PUT revisar 
  app.put("/api/revisiones/indicadores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateIndicador(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el indicador: ' + error });
    }
  })


  //DELETE 
  app.delete("/api/indicadores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteIndicador(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el indicador: ' + error });
    }
  })

  return app;
}