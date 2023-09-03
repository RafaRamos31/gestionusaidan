import { createSubarea, deleteSubarea, editSubarea, getSubAreaById, getSubareasByArea } from "../controllers/subareas-controller.js";

export const getSubareasEndpoints = (app, upload) => {

  //GET subareas
  app.get("/api/subareas/:idArea?", upload.any(), async (request, response) => {
    try {
      const subareas = await getSubareasByArea(request.params.idArea);
      response.json(subareas);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las Sub Areas Tematicas: ' + error });
    }
  })

  //GET municipio by Id
  app.get("/api/subarea/:idSubarea", upload.any(), async (request, response) => {
    try {
      const subarea = await getSubAreaById(request.params.idSubarea);
      if(!subarea) return response.status(404).send('Sub Area Tematica no encontrada');

      response.json(subarea);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la Sub Area Tematica: ' + error });
    }
  })

  //POST subarea
  app.post("/api/subareas", upload.any(), async (request, response) => {
    try {
      const subarea = await createSubarea(
        request.body.nombre,
        request.body.idArea,
      );
      response.json(subarea);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar la Sub Area Tematica: ' + error });
    }
  })

  //PUT modificar subarea
  app.put("/api/subareas", upload.any(), async (request, response) => {
    try {
      const subarea = await editSubarea(
        request.body.idSubarea,
        request.body.nombre,
        request.body.idArea,
      );
  
      if(!subarea) return response.status(404).send('Sub Area Tematica no encontrada');

      response.status(200).json({subarea});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la Sub Area Tematica: ' + error });
    }
  })


  //DELETE eliminar subarea
  app.delete("/api/subareas", upload.any(), async (request, response) => {
    try {
      const subarea = await deleteSubarea(
        request.body.idSubarea
      );

      if(!subarea) return response.status(404).send('Sub Area Tematica no encontrada');

      response.status(200).json({subarea});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la Sub Area Tematica: ' + error });
    }
  })

  return app;
}