import { createTipoOrganizacion, deleteTipoOrganizacion, editTipoOrganizacion, getCountTiposOrganizaciones, getListTiposOrganizaciones, getPagedTiposOrganizaciones, getRevisionesTipoOrganizacion, getTipoOrganizacionById, revisarUpdateTipoOrganizacion } from "../controllers/tiposOrganizaciones-controller.js";

export const getOrgTypesEndpoints = (app, upload) => {

   //GET count tipos de organizaciones
  app.post("/api/count/tipoOrganizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountTiposOrganizaciones({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los tipos de organizaciones: ' + error });
    }
  })

  //POST Get PAGED tipos de organizaciones
  app.post("/api/paged/tipoOrganizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedTiposOrganizaciones({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los tipos de organizaciones: ' + error });
    }
  })


  //POST Get List tipos de organizaciones
  app.post("/api/list/tipoOrganizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListTiposOrganizaciones({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los tipos de organizaciones: ' + error });
    }
  })


  //GET tipo de organizacion by Id
  app.get("/api/tipoOrganizacion/:idTipoOrganizacion", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getTipoOrganizacionById(
        authorizationHeader,
        response,
        request.params.idTipoOrganizacion
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el tipo de organización: ' + error });
    }
  })


  //GET revisiones tipo de organizacion
  app.get("/api/revisiones/tipoOrganizacion/:idTipoOrganizacion", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesTipoOrganizacion(
        authorizationHeader,
        response,
        request.params.idTipoOrganizacion
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del tipo de organización: ' + error });
    }
  })


  //POST tipo de organizacion
  app.post("/api/tipoOrganizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createTipoOrganizacion(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.idSector,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el tipo de organización: ' + error });
    }
  })


  //PUT modificar tipo de organizacion
  app.put("/api/tipoOrganizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editTipoOrganizacion(
        authorizationHeader,
        response,
        request.body.idTipoOrganizacion,
        request.body.nombre,
        request.body.idSector,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el tipo de organizacion: ' + error });
    }
  })


  //PUT revisar tipo de organizacion
  app.put("/api/revisiones/tipoOrganizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateTipoOrganizacion(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el tipo de organizacion: ' + error });
    }
  })


  //DELETE eliminar tipo organizacion
  app.delete("/api/tipoOrganizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteTipoOrganizacion(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el tipo de organización: ' + error });
    }
  })

  return app;
}