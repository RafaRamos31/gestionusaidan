import { createArea, deleteArea, editArea, getAllAreas, getAreaById } from "../controllers/areas-controller.js";

export const getAreasEndpoints = (app, upload) => {

  //GET areas
  app.get("/api/areas", async (request, response) => {
    try {
      const areas = await getAllAreas();
      response.json(areas);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las Áreas Temáticas: ' + error });
    }
  })

  //GET area by Id
  app.get("/api/area/:idArea", upload.any(), async (request, response) => {
    try {
      const area = await getAreaById(request.params.idArea);
      if(!area) return response.status(404).send('Área temática no encontrada');

      response.json(area);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el Área Temática: ' + error });
    }
  })

  //POST areas
  app.post("/api/areas", upload.any(), async (request, response) => {
    try {
      const area = await createArea(
        request.body.nombre,
        request.body.idUsuario
      );
      response.json(area);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el Área Temática: ' + error });
    }
  })

  //PUT modificar Area
  app.put("/api/areas", upload.any(), async (request, response) => {
    try {
      const area = await editArea(
        request.body.idArea,
        request.body.nombre,
        request.body.idUsuario
      );
  
      if(!area) return response.status(404).send('Área Temática no encontrada');

      response.status(200).json({area});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Área Temática: ' + error });
    }
  })


  //DELETE eliminar area
  app.delete("/api/areas", upload.any(), async (request, response) => {
    try {
      const area = await deleteArea(
        request.body.idArea
      );

      if(!area) return response.status(404).send('Área Temática no encontrada');

      response.status(200).json({area});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Área Temática: ' + error });
    }
  })

  return app;
}