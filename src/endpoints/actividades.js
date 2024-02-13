import { createActividad, deleteActividad, editActividad, getActividadById, getCountActividades, getListActividades, getPagedActividades, getRevisionesActividades, revisarUpdateActividad } from "../controllers/actividades-controller.js";

export const getActividadesEndpoints = (app, upload) => {

  //GET count subresultados
  app.post("/api/count/actividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountActividades({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las actividades: ' + error });
    }
  })

  //POST Get PAGED actividades
  app.post("/api/paged/actividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedActividades({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener las actividades: ' + error });
    }
  })


  //POST Get List actividades
  app.post("/api/list/actividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListActividades({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las actividades: ' + error });
    }
  })


  //GET resultado by Id
  app.get("/api/actividad/:idActividad", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getActividadById(
        authorizationHeader,
        response,
        request.params.idActividad
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la actividad: ' + error });
    }
  })
  

  //GET revisiones actividad
  app.get("/api/revisiones/actividad/:idActividad", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesActividades(
        authorizationHeader,
        response,
        request.params.idActividad
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones de la actividad: ' + error });
    }
  })


  //POST resultado
  app.post("/api/actividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createActividad(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.descripcion,
        request.body.idResultado,
        request.body.idSubresultado,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar la actividad: ' + error });
    }
  })

  //PUT modificar resultados
  app.put("/api/actividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editActividad(
        authorizationHeader,
        response,
        request.body.idActividad,
        request.body.nombre,
        request.body.descripcion,
        request.body.idResultado,
        request.body.idSubresultado,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la actividad: ' + error });
    }
  })

  //PUT revisar resultado
  app.put("/api/revisiones/actividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateActividad(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar la actividad: ' + error });
    }
  })


  //DELETE eliminar resultado
  app.delete("/api/actividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteActividad(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la actividad: ' + error });
    }
  })

  return app;
}