import { createQuarter, deleteQuarter, editQuarter, getCountQuarter, getListQuarters, getPagedQuarters, getQuarterById, getRevisionesQuarter, revisarUpdateQuarter } from "../controllers/quarters-controller.js";

export const getQuartersEndpoints = (app, upload) => {

  //GET count
  app.post("/api/count/quarters", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountQuarter({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los trimestres: ' + error });
    }
  })

  //POST Get PAGED 
  app.post("/api/paged/quarters", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedQuarters({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los trimestres: ' + error });
    }
  })


  //POST Get List
  app.post("/api/list/quarters", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListQuarters({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los trimestres: ' + error });
    }
  })


  //GET by Id
  app.get("/api/quarter/:idQuarter", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getQuarterById(
        authorizationHeader,
        response,
        request.params.idQuarter
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el trimestre: ' + error });
    }
  })
  

  //GET revisiones 
  app.get("/api/revisiones/quarter/:idQuarter", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesQuarter(
        authorizationHeader,
        response,
        request.params.idQuarter
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del trimestre: ' + error });
    }
  })


  //POST crear
  app.post("/api/quarters", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createQuarter(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.idYear,
        request.body.fechaInicio,
        request.body.fechaFinal,
        request.body.timezone,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el trimestre: ' + error });
    }
  })

  //PUT modificar year
  app.put("/api/quarters", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editQuarter(
        authorizationHeader,
        response,
        request.body.idQuarter,
        request.body.nombre,
        request.body.idYear,
        request.body.fechaInicio,
        request.body.fechaFinal,
        request.body.timezone,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el trimestre: ' + error });
    }
  })

  //PUT revisar
  app.put("/api/revisiones/quarters", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateQuarter(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el trimestre: ' + error });
    }
  })


  //DELETE eliminar 
  app.delete("/api/quarters", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteQuarter(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el trimestre: ' + error });
    }
  })

  return app;
}