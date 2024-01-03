import { createInversion, deleteInversion, editInversion, getInversionById, getInversiones } from "../controllers/inversiones-controller.js";

export const getInversionesEndpoints = (app, upload) => {

  //GET/POST inversiones
  app.post("/api/getinversiones", upload.any(), async (request, response) => {
    try {
      const inversiones = await getInversiones(
        request.body.idArea,
        request.body.idDepartamento,
        request.body.idMunicipio,
        request.body.idAldea,
        request.body.idCaserio
      );
      response.json(inversiones);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las inversiones: ' + error });
    }
  })

  //GET Inversion by Id
  app.get("/api/inversion/:idInversion", upload.any(), async (request, response) => {
    try {
      const inversion = await getInversionById(request.params.idInversion);
      if(!inversion) return response.status(404).send('Inversion no encontrada');

      response.json(inversion);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la inversión: ' + error });
    }
  })

  //POST Inversión
  app.post("/api/inversiones", upload.any(), async (request, response) => {
    try {
      const inversion = await createInversion(
        request.body.nombre,
        request.body.sector,
        request.body.idArea,
        request.body.idDepartamento,
        request.body.idMunicipio,
        request.body.idAldea,
        request.body.idCaserio,
        request.body.fecha,
        request.body.monto,
        request.body.idUsuario
      );
      response.json(inversion);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar la inversión: ' + error });
    }
  })


  //PUT Editar Inversion
  app.put("/api/inversiones", upload.any(), async (request, response) => {
    try {
      const inversion = await editInversion(
        request.body.idInversion,
        request.body.nombre,
        request.body.sector,
        request.body.idArea,
        request.body.idDepartamento,
        request.body.idMunicipio,
        request.body.idAldea,
        request.body.idCaserio,
        request.body.fecha,
        request.body.monto,
        request.body.idUsuario
      );

      if(!inversion) return response.status(404).send('Inversión no encontrada');

      response.json(inversion);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la inversión: ' + error });
    }
  })

  //DELETE Eliminar inversion
  app.delete("/api/inversiones", upload.any(), async (request, response) => {
    try {
      const inversion = await deleteInversion(request.body.idInversion);
      if(!inversion) return response.status(404).send('Inversión no encontrada');

      response.json(inversion);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la inversión: ' + error });
    }
  })

  return app;
}