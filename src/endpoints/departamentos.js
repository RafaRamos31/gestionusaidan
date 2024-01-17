import { createDepartamento, deleteDepartamento, editDepartamento, getAllDepartamentos, getAllRevisionesDepartamentos, getDepartamentoById, getRevisionesDepartamento, revisarUpdateDepartamento } from "../controllers/departamentos-controller.js";

export const getDepartamentosEndpoints = (app, upload) => {

  //GET departamentos
  app.get("/api/departamentos", async (request, response) => {
    try {
      const departamentos = await getAllDepartamentos();
      response.json(departamentos);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los departamentos: ' + error });
    }
  })

  //GET departamento by Id
  app.get("/api/departamento/:idDepartamento", upload.any(), async (request, response) => {
    try {
      const departamento = await getDepartamentoById(request.params.idDepartamento);
      if(!departamento) return response.status(404).send('Departamento no encontrado');

      response.json(departamento);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el departamento: ' + error });
    }
  })
  
  //GET all revisiones departamentos
  app.get("/api/departamentos/revisiones", async (request, response) => {
    try {
      const revisiones = await getAllRevisionesDepartamentos();
      response.json(revisiones);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones: ' + error });
    }
  })

  //GET revisiones departamento
  app.get("/api/departamento/revision/:idDepartamento", upload.any(), async (request, response) => {
    try {
      const revisiones = await getRevisionesDepartamento(request.params.idDepartamento);
      if(!revisiones) return response.status(404).send('Departamento no encontrado');

      response.json(revisiones);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del departamento: ' + error });
    }
  })

  //POST departamento
  app.post("/api/departamentos", upload.any(), async (request, response) => {
    try {
        response = await createDepartamento(
        response,
        request.body.nombre,
        request.body.geocode,
        request.body.idUsuario,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el departamento: ' + error });
    }
  })

  //PUT modificar departamento
  app.put("/api/departamentos", upload.any(), async (request, response) => {
    try {
      response = await editDepartamento(
        response,
        request.body.idDepartamento,
        request.body.nombre,
        request.body.geocode,
        request.body.idUsuario,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Departamento: ' + error });
    }
  })

   //PUT modificar departamento
  app.put("/api/departamentos/revisar", upload.any(), async (request, response) => {
    try {
      response = await revisarUpdateDepartamento(
        response,
        request.body.idDepartamento,
        request.body.idUsuario,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el Departamento: ' + error });
    }
  })


  //DELETE eliminar departamento
  app.delete("/api/departamentos", upload.any(), async (request, response) => {
    try {
      response = await deleteDepartamento(
        response,
        request.body.idDepartamento,
        request.body.idEliminador,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Departamento: ' + error });
    }
  })

  return app;
}