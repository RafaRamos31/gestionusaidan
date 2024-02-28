import { editConfig, getGeneralConfig } from "../controllers/generalConfig-controller.js";

export const getGeneralConfigEndpoints = (app, upload) => {

  //GET config
  app.get("/api/config", upload.any(), async (request, response) => {
    try {

      const config = await getGeneralConfig();
      response.json(config)
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la configuración: ' + error });
    }
  })

  //PUT edit config
  app.put("/api/config", upload.any(), async (request, response) => {
    try {
      response = await editConfig({
        response,
        idCurrentYear: request.body.idCurrentYear,
        enableSubirPlanificacion: request.body.enableSubirPlanificacion
    });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la configuración: ' + error });
    }
  })

  return app;
}