import { createOrganizacion, deleteOrganizacion, editOrganizacion, getCountOrganizaciones, getListOrganizaciones, getOrganizacionById, getPagedOrganizaciones, getRevisionesOrganizacion, revisarUpdateOrganizacion } from "../controllers/organizaciones-controller.js";

export const getOrganizacionesEndpoints = (app, upload) => {

  //GET count municipios
  app.post("/api/count/organizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountOrganizaciones({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las organizaciones: ' + error });
    }
  })

  //POST Get PAGED organizaciones
  app.post("/api/paged/organizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedOrganizaciones({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener las organizaciones: ' + error });
    }
  })


  //POST Get List organizaciones
  app.post("/api/list/organizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListOrganizaciones({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las organizaciones: ' + error });
    }
  })


  //GET organizacion by Id
  app.get("/api/organizacion/:idOrganizacion", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getOrganizacionById(
        authorizationHeader,
        response,
        request.params.idOrganizacion
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la organización: ' + error });
    }
  })


  //GET revisiones organizacion
  app.get("/api/revisiones/organizacion/:idOrganizacion", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesOrganizacion(
        authorizationHeader,
        response,
        request.params.idOrganizacion
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones de la organización: ' + error });
    }
  })


  //POST organizacion
  app.post("/api/organizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createOrganizacion({
        header: authorizationHeader,
        response,
        nombre: request.body.nombre,
        codigoOrganizacion: request.body.codigoOrganizacion,
        idSector: request.body.idSector,
        idTipoOrganizacion: request.body.idTipoOrganizacion,
        nivelOrganizacion: request.body.nivelOrganizacion,
        idDepartamento: request.body.idDepartamento,
        idMunicipio: request.body.idMunicipio,
        idAldea: request.body.idAldea,
        idCaserio: request.body.idCaserio,
        telefonoOrganizacion: request.body.telefonoOrganizacion,
        nombreContacto: request.body.nombreContacto,
        telefonoContacto: request.body.telefonoContacto,
        correoContacto: request.body.correoContacto,
        geolocacion: request.body.geolocacion,
        aprobar: JSON.parse(request.body.aprobar)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar la organización: ' + error });
    }
  })


  //PUT modificar organizacion
  app.put("/api/organizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editOrganizacion({
        header: authorizationHeader,
        response,
        idOrganizacion: request.body.idOrganizacion,
        nombre: request.body.nombre,
        codigoOrganizacion: request.body.codigoOrganizacion,
        idSector: request.body.idSector,
        idTipoOrganizacion: request.body.idTipoOrganizacion,
        nivelOrganizacion: request.body.nivelOrganizacion,
        idDepartamento: request.body.idDepartamento,
        idMunicipio: request.body.idMunicipio,
        idAldea: request.body.idAldea,
        idCaserio: request.body.idCaserio,
        telefonoOrganizacion: request.body.telefonoOrganizacion,
        nombreContacto: request.body.nombreContacto,
        telefonoContacto: request.body.telefonoContacto,
        correoContacto: request.body.correoContacto,
        geolocacion: request.body.geolocacion,
        aprobar: JSON.parse(request.body.aprobar)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la organización: ' + error });
    }
  })


  //PUT revisar municipio
  app.put("/api/revisiones/organizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateOrganizacion(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar la organización: ' + error });
    }
  })


  //DELETE eliminar organizacion
  app.delete("/api/organizaciones", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteOrganizacion(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la organización: ' + error });
    }
  })

  return app;
}