import { createRol, deleteRol, editRol, getCountRoles, getListRoles, getPagedRoles, getRevisionesRol, getRolById, revisarUpdateRol } from "../controllers/roles-controller.js";

export const getRolesEndpoints = (app, upload) => {

  //GET count roles
  app.post("/api/count/roles", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountRoles({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los roles: ' + error });
    }
  })

  //POST Get PAGED roles
  app.post("/api/paged/roles", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedRoles({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los roles: ' + error });
    }
  })


  //POST Get List roles
  app.post("/api/list/roles", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListRoles({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter),
        sort: JSON.parse(request.body.sort),
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los roles: ' + error });
    }
  })


  //GET rol by Id
  app.get("/api/rol/:idRol", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRolById(
        authorizationHeader,
        response,
        request.params.idRol
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el rol: ' + error });
    }
  })
  

  //GET revisiones rol
  app.get("/api/revisiones/rol/:idRol", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesRol(
        authorizationHeader,
        response,
        request.params.idRol
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del rol: ' + error });
    }
  })


  //POST rol
  app.post("/api/roles", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createRol(
        authorizationHeader,
        response,
        request.body.nombre,
        JSON.parse(request.body.permisos),
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el rol: ' + error });
    }
  })

  //PUT modificar departamento
  app.put("/api/roles", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editRol(
        authorizationHeader,
        response,
        request.body.idRol,
        request.body.nombre,
        JSON.parse(request.body.permisos),
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Rol: ' + error });
    }
  })

  //PUT revisar rol
  app.put("/api/revisiones/roles", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateRol(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el Rol: ' + error });
    }
  })


  //DELETE eliminar rol
  app.delete("/api/roles", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteRol(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Rol: ' + error });
    }
  })

  return app;
}