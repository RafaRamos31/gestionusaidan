import { createYear, deleteYear, editYear, getCountYears, getListYears, getPagedYears, getRevisionesYear, getYearById, revisarUpdateYear } from "../controllers/years-controller.js";

export const getYearsEndpoints = (app, upload) => {

  //GET count departamentos
  app.post("/api/count/years", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountYears({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los años fiscales: ' + error });
    }
  })

  //POST Get PAGED years
  app.post("/api/paged/years", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedYears({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los años fiscales: ' + error });
    }
  })


  //POST Get List departamentos
  app.post("/api/list/years", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListYears({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los años fiscales: ' + error });
    }
  })


  //GET year by Id
  app.get("/api/year/:idYear", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getYearById(
        authorizationHeader,
        response,
        request.params.idYear
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el año fiscal: ' + error });
    }
  })
  

  //GET revisiones year
  app.get("/api/revisiones/year/:idYear", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesYear(
        authorizationHeader,
        response,
        request.params.idYear
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del año fiscal: ' + error });
    }
  })


  //POST year
  app.post("/api/years", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createYear(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.fechaInicio,
        request.body.fechaFinal,
        request.body.timezone,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el año fiscal: ' + error });
    }
  })

  //PUT modificar year
  app.put("/api/years", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editYear(
        authorizationHeader,
        response,
        request.body.idYear,
        request.body.nombre,
        request.body.fechaInicio,
        request.body.fechaFinal,
        request.body.timezone,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Año fiscal: ' + error });
    }
  })

  //PUT revisar year
  app.put("/api/revisiones/years", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateYear(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el año fiscal: ' + error });
    }
  })


  //DELETE eliminar year
  app.delete("/api/years", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteYear(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el año fiscal: ' + error });
    }
  })

  return app;
}