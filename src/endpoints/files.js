import { deleteFile, getFile, postFile } from "../controllers/files-controller.js";

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

  return app;
}