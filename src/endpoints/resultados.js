import { createResultado, deleteResultado, editResultado, getCountResultados, getListResultados, getPagedResultados, getResultadoById, getRevisionesResultado, revisarUpdateResultado } from "../controllers/resultados-controller.js";

export const getResultadosEndpoints = (app, upload) => {

  //GET count departamentos
  app.post("/api/count/resultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountResultados({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los resultados: ' + error });
    }
  })

  //POST Get PAGED resultados
  app.post("/api/paged/resultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedResultados({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los resultados: ' + error });
    }
  })


  //POST Get List resultados
  app.post("/api/list/resultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListResultados({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los resultados: ' + error });
    }
  })


  //GET resultado by Id
  app.get("/api/resultado/:idResultado", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getResultadoById(
        authorizationHeader,
        response,
        request.params.idResultado
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el resultado: ' + error });
    }
  })
  

  //GET revisiones resultado
  app.get("/api/revisiones/resultado/:idResultado", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesResultado(
        authorizationHeader,
        response,
        request.params.idResultado
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del resultado: ' + error });
    }
  })


  //POST resultado
  app.post("/api/resultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createResultado(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.descripcion,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el resultado: ' + error });
    }
  })

  //PUT modificar resultados
  app.put("/api/resultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editResultado(
        authorizationHeader,
        response,
        request.body.idResultado,
        request.body.nombre,
        request.body.descripcion,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Resultado: ' + error });
    }
  })

  //PUT revisar resultado
  app.put("/api/revisiones/resultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateResultado(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el Resultado: ' + error });
    }
  })


  //DELETE eliminar resultado
  app.delete("/api/resultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteResultado(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Resultado: ' + error });
    }
  })

  return app;
}