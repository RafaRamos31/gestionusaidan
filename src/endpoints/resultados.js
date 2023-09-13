import { createResultado, deleteResultado, editResultado, getAllResultados, getResultadoById } from "../controllers/resultados.js";

export const getResultadosEndpoints = (app, upload) => {

  //GET resultados
  app.get("/api/resultados", upload.any(), async (request, response) => {
    try {
      const resultados = await getAllResultados();
      response.json(resultados);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los resultados: ' + error });
    }
  })

  //GET resultado by Id
  app.get("/api/resultado/:idResultado", upload.any(), async (request, response) => {
    try {
      const resultado = await getResultadoById(request.params.idResultado);
      if(!resultado) return response.status(404).send('Resultado no encontrado');

      response.json(resultado);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el resultado: ' + error });
    }
  })

  //POST resultado
  app.post("/api/resultados", upload.any(), async (request, response) => {
    try {
      const resultado = await createResultado(
        request.body.codigo,
        request.body.nombre,
        request.body.fechaInicio,
        request.body.fechaFinal,
        request.body.idUsuario
      );
      response.json(resultado);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el resultado: ' + error });
    }
  })

  //PUT modificar resultado
  app.put("/api/resultados", upload.any(), async (request, response) => {
    try {
      const resultado = await editResultado(
        request.body.idResultado,
        request.body.codigo,
        request.body.nombre,
        request.body.fechaInicio,
        request.body.fechaFinal,
        request.body.idUsuario
      );
  
      if(!resultado) return response.status(404).send('Resultado no encontrado');

      response.status(200).json({resultado});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Resultado: ' + error });
    }
  })


  //DELETE eliminar resultado
  app.delete("/api/resultados", upload.any(), async (request, response) => {
    try {
      const resultado = await deleteResultado(
        request.body.idResultado
      );

      if(!resultado) return response.status(404).send('Resultado no encontrado');

      response.status(200).json({resultado});
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Resultado: ' + error });
    }
  })

  return app;
}