import { createMunicipio, deleteMunicipio, editMunicipio, getCountMunicipios, getListMunicipios, getMunicipioById, getPagedMunicipios, getRevisionesMunicipio, revisarUpdateMunicipio } from "../controllers/municipios-controller.js";

export const getMunicipiosEndpoints = (app, upload) => {

  //GET count municipios
  app.post("/api/count/municipios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountMunicipios({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los municipios: ' + error });
    }
  })

  //POST Get PAGED municipios
  app.post("/api/paged/municipios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedMunicipios({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los municipios: ' + error });
    }
  })


  //POST Get List municipios
  app.post("/api/list/municipios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListMunicipios({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los municipios: ' + error });
    }
  })


  //GET municipio by Id
  app.get("/api/municipio/:idMunicipio", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getMunicipioById(
        authorizationHeader,
        response,
        request.params.idMunicipio
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el municipio: ' + error });
    }
  })


  //GET revisiones municipio
  app.get("/api/revisiones/municipio/:idMunicipio", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesMunicipio(
        authorizationHeader,
        response,
        request.params.idMunicipio
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del municipio: ' + error });
    }
  })


  //POST municipio
  app.post("/api/municipios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createMunicipio(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.geocode,
        request.body.idDepartamento,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el municipio: ' + error });
    }
  })


  //PUT modificar municipios
  app.put("/api/municipios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editMunicipio(
        authorizationHeader,
        response,
        request.body.idMunicipio,
        request.body.nombre,
        request.body.geocode,
        request.body.idDepartamento,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el municipio: ' + error });
    }
  })


  //PUT revisar municipio
  app.put("/api/revisiones/municipios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateMunicipio(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el municipio: ' + error });
    }
  })


  //DELETE eliminar departamento
  app.delete("/api/municipios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteMunicipio(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el municipio: ' + error });
    }
  })

  return app;
}