import { createDepartamento, deleteDepartamento, editDepartamento, getAllDepartamentos, getAllRevisionesDepartamentos, getDepartamentoById, getRevisionesDepartamento, revisarUpdateDepartamento } from "../controllers/departamentos-controller.js";

export const getDepartamentosEndpoints = (app, upload) => {

  //GET departamentos
  app.get("/api/departamentos", async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getAllDepartamentos(authorizationHeader, response);

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los departamentos: ' + error });
    }
  })

  //GET departamento by Id
  app.get("/api/departamento/:idDepartamento", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getDepartamentoById(
        authorizationHeader,
        response,
        request.params.idDepartamento
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el departamento: ' + error });
    }
  })
  
  //GET all revisiones departamentos
  app.get("/api/departamentos/revisiones", async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getAllRevisionesDepartamentos(authorizationHeader, response);

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones: ' + error });
    }
  })

  //GET revisiones departamento
  app.get("/api/departamento/revision/:idDepartamento", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesDepartamento(
        authorizationHeader,
        response,
        request.params.idDepartamento
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del departamento: ' + error });
    }
  })

  //POST departamento
  app.post("/api/departamentos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createDepartamento(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.geocode,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el departamento: ' + error });
    }
  })

  //PUT modificar departamento
  app.put("/api/departamentos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editDepartamento(
        authorizationHeader,
        response,
        request.body.idDepartamento,
        request.body.nombre,
        request.body.geocode,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Departamento: ' + error });
    }
  })

   //PUT modificar departamento
  app.put("/api/departamentos/revisar", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateDepartamento(
        authorizationHeader,
        response,
        request.body.idDepartamento,
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
      const authorizationHeader = request.headers['authorization'];

      response = await deleteDepartamento(
        authorizationHeader,
        response,
        request.body.idDepartamento,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Departamento: ' + error });
    }
  })

  return app;
}