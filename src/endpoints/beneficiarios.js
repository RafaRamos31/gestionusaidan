import { createBeneficiario, deleteBeneficiario, editBeneficiario, getBeneficiarioById, getBeneficiarios } from "../controllers/beneficiarios-controller.js";

export const getBeneficiariosEndpoints = (app, upload) => {

  //GET/POST beneficiarios
  app.post("/api/getbeneficiarios", upload.any(), async (request, response) => {
    try {
      const beneficiarios = await getBeneficiarios(
        request.body.idDepartamento,
        request.body.idMunicipio,
        request.body.idAldea,
        request.body.idCaserio,
        request.body.idOrganizacion,
        request.body.idCargo
      );
      response.json(beneficiarios);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los beneficiarios: ' + error });
    }
  })

  //GET Beneficiario by Id
  app.get("/api/beneficiarios/:idBeneficiario", upload.any(), async (request, response) => {
    try {
      const beneficiario = await getBeneficiarioById(request.params.idBeneficiario);
      if(!beneficiario) return response.status(404).send('Beneficiario no encontrado');

      response.json(beneficiario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el beneficiario: ' + error });
    }
  })

  //POST Beneficiario
  app.post("/api/beneficiarios", upload.any(), async (request, response) => {
    try {
      const beneficiario = await createBeneficiario(
        request.body.dni,
        request.body.nombre,
        request.body.sexo,
        request.body.fechaNacimiento,
        request.body.idDepartamento,
        request.body.idMunicipio,
        request.body.idAldea,
        request.body.idCaserio,
        request.body.telefono,
        request.body.idOrganizacion,
        request.body.idCargo,
        request.body.geolocacion,
        request.body.idUsuario
      );
      response.json(beneficiario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el beneficiario: ' + error });
    }
  })


  //PUT Editar Beneficiario
  app.put("/api/beneficiarios", upload.any(), async (request, response) => {
    try {
      const beneficiario = await editBeneficiario(
        request.body.idBeneficiario,
        request.body.dni,
        request.body.nombre,
        request.body.sexo,
        request.body.fechaNacimiento,
        request.body.idDepartamento,
        request.body.idMunicipio,
        request.body.idAldea,
        request.body.idCaserio,
        request.body.telefono,
        request.body.idOrganizacion,
        request.body.idCargo,
        request.body.geolocacion,
        request.body.idUsuario
      );

      if(!beneficiario) return response.status(404).send('Beneficiario no encontrado');

      response.json(beneficiario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el beneficiario: ' + error });
    }
  })

  //DELETE Eliminar beneficiario
  app.delete("/api/beneficiarios", upload.any(), async (request, response) => {
    try {
      const beneficiario = await deleteBeneficiario(request.body.idBeneficiario);
      if(!beneficiario) return response.status(404).send('Beneficiario no encontrado');

      response.json(beneficiario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el beneficiario: ' + error });
    }
  })

  return app;
}