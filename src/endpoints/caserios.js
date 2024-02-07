import { createCaserio, deleteCaserio, editCaserio, getCaserioById, getCountCaserios, getListCaserios, getPagedCaserios, getRevisionesCaserio, revisarUpdateCaserio } from "../controllers/caserios-controller.js";

export const getCaseriosEndpoints = (app, upload) => {

  //GET count municipios
  app.post("/api/count/caserios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountCaserios({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los caserios: ' + error });
    }
  })

  //POST Get PAGED caserios
  app.post("/api/paged/caserios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedCaserios({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los caserios: ' + error });
    }
  })


  //POST Get List caserios
  app.post("/api/list/caserios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListCaserios({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los caserios: ' + error });
    }
  })


  //GET caserio by Id
  app.get("/api/caserio/:idCaserio", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCaserioById(
        authorizationHeader,
        response,
        request.params.idCaserio
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el caserio: ' + error });
    }
  })


  //GET revisiones municipio
  app.get("/api/revisiones/caserio/:idCaserio", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesCaserio(
        authorizationHeader,
        response,
        request.params.idCaserio
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del caserio: ' + error });
    }
  })


  //POST caserio
  app.post("/api/caserios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createCaserio(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.geocode,
        request.body.idAldea,
        request.body.idMunicipio,
        request.body.idDepartamento,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el caserio: ' + error });
    }
  })


  //PUT modificar caserio
  app.put("/api/caserios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editCaserio(
        authorizationHeader,
        response,
        request.body.idCaserio,
        request.body.nombre,
        request.body.geocode,
        request.body.idAldea,
        request.body.idMunicipio,
        request.body.idDepartamento,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el caserio: ' + error });
    }
  })


  //PUT revisar caserio
  app.put("/api/revisiones/caserios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateCaserio(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el caserio: ' + error });
    }
  })


  //DELETE eliminar caserio
  app.delete("/api/caserios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteCaserio(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el caserio: ' + error });
    }
  })

  return app;
}