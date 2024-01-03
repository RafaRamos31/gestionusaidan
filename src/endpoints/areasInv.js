import { createAreaInv, deleteAreaInv, editAreaInv, getAllAreasInv, getAreaInvById } from "../controllers/areasInv-controller.js";

export const getAreasInvEndpoints = (app, upload) => {

  //GET areas
  app.get("/api/areasinv", async (request, response) => {
    try {
      const areas = await getAllAreasInv();
      response.json(areas);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las Áreas Temáticas: ' + error });
    }
  })

  //GET area by Id
  app.get("/api/areaInv/:idArea", upload.any(), async (request, response) => {
    try {
      const area = await getAreaInvById(request.params.idArea);
      if(!area) return response.status(404).send('Área temática no encontrada');

      response.json(area);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el Área Temática: ' + error });
    }
  })

  //POST areas
  app.post("/api/areasinv", upload.any(), async (request, response) => {
    try {
      const area = await createAreaInv(
        request.body.nombre,
        request.body.idUsuario
      );
      response.json(area);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el Área Temática: ' + error });
    }
  })

  //PUT modificar Area
  app.put("/api/areasinv", upload.any(), async (request, response) => {
    try {
      const area = await editAreaInv(
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
  app.delete("/api/areasinv", upload.any(), async (request, response) => {
    try {
      const area = await deleteAreaInv(
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