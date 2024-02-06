import { createBeneficiario, deleteBeneficiario, editBeneficiario, getBeneficiarioById, getCountBeneficiarios, getListBeneficiarios, getPagedBeneficiarios, getRevisionesBeneficiario, revisarUpdateBeneficiario } from "../controllers/beneficiarios-controller.js";

export const getBeneficiariosEndpoints = (app, upload) => {

  //GET count beneficiarios
  app.post("/api/count/beneficiarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountBeneficiarios({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los beneficiarios: ' + error });
    }
  })

  //POST Get PAGED organizaciones
  app.post("/api/paged/beneficiarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedBeneficiarios({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los beneficiarios: ' + error });
    }
  })


  //POST Get List beneficiarios
  app.post("/api/list/beneficiarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListBeneficiarios({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los beneficiarios: ' + error });
    }
  })


  //GET organizacion by Id
  app.get("/api/beneficiario/:idBeneficiario", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getBeneficiarioById(
        authorizationHeader,
        response,
        request.params.idBeneficiario
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener Beneficiario: ' + error });
    }
  })


  //GET revisiones beneficiario
  app.get("/api/revisiones/beneficiario/:idBeneficiario", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesBeneficiario(
        authorizationHeader,
        response,
        request.params.idBeneficiario
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del Beneficiario: ' + error });
    }
  })


  //POST organizacion
  app.post("/api/beneficiarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createBeneficiario({
        header: authorizationHeader,
        response,
        nombre: request.body.nombre,
        sexo: request.body.sexo,
        fechaNacimiento: request.body.fechaNacimiento,
        dni: request.body.dni,
        idSector: request.body.idSector,
        idTipoOrganizacion: request.body.idTipoOrganizacion,
        idOrganizacion: request.body.idOrganizacion,
        idCargo: request.body.idCargo,
        telefono: request.body.telefono,
        idDepartamento: request.body.idDepartamento,
        idMunicipio: request.body.idMunicipio,
        idAldea: request.body.idAldea,
        idCaserio: request.body.idCaserio,
        geolocacion: request.body.geolocacion,
        aprobar: JSON.parse(request.body.aprobar)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar Beneficiario: ' + error });
    }
  })


  //PUT modificar beneficiario
  app.put("/api/beneficiarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editBeneficiario({
        header: authorizationHeader,
        response,
        idBeneficiario: request.body.idBeneficiario,
        nombre: request.body.nombre,
        sexo: request.body.sexo,
        fechaNacimiento: request.body.fechaNacimiento,
        dni: request.body.dni,
        idSector: request.body.idSector,
        idTipoOrganizacion: request.body.idTipoOrganizacion,
        idOrganizacion: request.body.idOrganizacion,
        idCargo: request.body.idCargo,
        telefono: request.body.telefono,
        idDepartamento: request.body.idDepartamento,
        idMunicipio: request.body.idMunicipio,
        idAldea: request.body.idAldea,
        idCaserio: request.body.idCaserio,
        geolocacion: request.body.geolocacion,
        aprobar: JSON.parse(request.body.aprobar)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar Beneficiario: ' + error });
    }
  })


  //PUT revisar beneficiario
  app.put("/api/revisiones/beneficiarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateBeneficiario(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar Beneficiario: ' + error });
    }
  })


  //DELETE eliminar beneficiario
  app.delete("/api/beneficiarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteBeneficiario(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar Beneficiario: ' + error });
    }
  })

  return app;
}