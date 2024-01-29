import { createDepartamento, deleteDepartamento, editDepartamento, getCountDepartamentos, getDepartamentoById, getPagedDepartamentos, getRevisionesDepartamento, revisarUpdateDepartamento } from "../controllers/departamentos-controller.js";

export const getDepartamentosEndpoints = (app, upload) => {

   //GET count departamentos
  app.post("/api/count/departamentos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountDepartamentos({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los departamentos: ' + error });
    }
  })

   //POST Get PAGED departamentos
  app.post("/api/paged/departamentos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedDepartamentos({
        header: authorizationHeader,
        response,
        page: request.body.page,
        pageSize: request.body.pageSize,
        filter: JSON.parse(request.body.filter),
        sort: JSON.parse(request.body.sort),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });
      
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
  

  //GET revisiones departamento
  app.get("/api/revisiones/departamento/:idDepartamento", upload.any(), async (request, response) => {
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

   //PUT revisar departamento
  app.put("/api/revisiones/departamentos", upload.any(), async (request, response) => {
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
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Departamento: ' + error });
    }
  })

  return app;
}