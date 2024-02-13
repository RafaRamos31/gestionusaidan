import { createSubResultado, deleteSubresultado, editSubresultado, getCountSubResultados, getListSubResultados, getPagedSubResultados, getRevisionesSubResultado, getSubResultadoById, revisarUpdateSubresultado } from "../controllers/subresultados-controller.js";

export const getSubresultadosEndpoints = (app, upload) => {

  //GET count subresultados
  app.post("/api/count/subresultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountSubResultados({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los subresultados: ' + error });
    }
  })

  //POST Get PAGED resultados
  app.post("/api/paged/subresultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedSubResultados({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los subresultados: ' + error });
    }
  })


  //POST Get List subresultados
  app.post("/api/list/subresultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListSubResultados({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los subresultados: ' + error });
    }
  })


  //GET resultado by Id
  app.get("/api/subresultado/:idSubresultado", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getSubResultadoById(
        authorizationHeader,
        response,
        request.params.idSubresultado
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el subresultado: ' + error });
    }
  })
  

  //GET revisiones resultado
  app.get("/api/revisiones/subresultado/:idSubresultado", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesSubResultado(
        authorizationHeader,
        response,
        request.params.idSubresultado
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del subresultado: ' + error });
    }
  })


  //POST resultado
  app.post("/api/subresultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createSubResultado(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.descripcion,
        request.body.idResultado,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el subresultado: ' + error });
    }
  })

  //PUT modificar resultados
  app.put("/api/subresultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editSubresultado(
        authorizationHeader,
        response,
        request.body.idSubresultado,
        request.body.nombre,
        request.body.descripcion,
        request.body.idResultado,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Subresultado: ' + error });
    }
  })

  //PUT revisar resultado
  app.put("/api/revisiones/subresultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateSubresultado(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el Subresultado: ' + error });
    }
  })


  //DELETE eliminar resultado
  app.delete("/api/subresultados", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteSubresultado(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Subresultado: ' + error });
    }
  })

  return app;
}