import { createSubActividad, deleteSubActividad, editSubActividad, getCountSubActividades, getListSubActividades, getPagedSubActividades, getRevisionesSubActividades, getSubActividadById, revisarUpdateSubactividad } from "../controllers/subactividades-controller.js";

export const getSubActividadesEndpoints = (app, upload) => {

  //GET count subresultados
  app.post("/api/count/subactividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountSubActividades({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las sub-actividades: ' + error });
    }
  })

  //POST Get PAGED actividades
  app.post("/api/paged/subactividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedSubActividades({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener las sub-actividades: ' + error });
    }
  })


  //POST Get List actividades
  app.post("/api/list/subactividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListSubActividades({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las sub-actividades: ' + error });
    }
  })


  //GET resultado by Id
  app.get("/api/subactividad/:idSubActividad", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getSubActividadById(
        authorizationHeader,
        response,
        request.params.idSubActividad
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la sub-actividad: ' + error });
    }
  })
  

  //GET revisiones actividad
  app.get("/api/revisiones/subactividad/:idSubActividad", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesSubActividades(
        authorizationHeader,
        response,
        request.params.idSubActividad
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones de la sub-actividad: ' + error });
    }
  })


  //POST 
  app.post("/api/subactividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createSubActividad(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.descripcion,
        request.body.idResultado,
        request.body.idSubresultado,
        request.body.idActividad,
        JSON.parse(request.body.componentes)?.data,
        JSON.parse(request.body.areasTematicas)?.data,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar la sub-actividad: ' + error });
    }
  })

  //PUT modificar resultados
  app.put("/api/subactividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editSubActividad(
        authorizationHeader,
        response,
        request.body.idSubActividad,
        request.body.nombre,
        request.body.descripcion,
        request.body.idResultado,
        request.body.idSubresultado,
        request.body.idActividad,
        JSON.parse(request.body.componentes)?.data,
        JSON.parse(request.body.areasTematicas)?.data,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la sub-actividad: ' + error });
    }
  })

  //PUT revisar resultado
  app.put("/api/revisiones/subactividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateSubactividad(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar la sub-actividad: ' + error });
    }
  })


  //DELETE eliminar resultado
  app.delete("/api/subactividades", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteSubActividad(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la sub-actividad: ' + error });
    }
  })

  return app;
}