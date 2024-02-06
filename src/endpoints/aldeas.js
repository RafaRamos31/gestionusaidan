import { createAldea, deleteAldea, editAldea, getAldeaById, getCountAldeas, getListAldeas, getPagedAldeas, getRevisionesAldea, revisarUpdateAldea } from "../controllers/aldeas-controller.js";

export const getAldeasEndpoints = (app, upload) => {

  //GET count aldeas
  app.post("/api/count/aldeas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountAldeas({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las aldeas: ' + error });
    }
  })

  //POST Get PAGED aldeas
  app.post("/api/paged/aldeas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedAldeas({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener las aldeas: ' + error });
    }
  })


  //POST Get List aldeas
  app.post("/api/list/aldeas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListAldeas({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las aldeas: ' + error });
    }
  })


  //GET aldea by Id
  app.get("/api/aldea/:idAldea", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getAldeaById(
        authorizationHeader,
        response,
        request.params.idAldea
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la aldea: ' + error });
    }
  })


  //GET revisiones aldea
  app.get("/api/revisiones/aldea/:idAldea", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesAldea(
        authorizationHeader,
        response,
        request.params.idAldea
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones de la aldea: ' + error });
    }
  })


  //POST aldea
  app.post("/api/aldeas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createAldea(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.geocode,
        request.body.idMunicipio,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar la aldea: ' + error });
    }
  })


  //PUT modificar aldeas
  app.put("/api/aldeas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editAldea(
        authorizationHeader,
        response,
        request.body.idAldea,
        request.body.nombre,
        request.body.geocode,
        request.body.idMunicipio,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la aldea: ' + error });
    }
  })


  //PUT revisar aldea
  app.put("/api/revisiones/aldeas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateAldea(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar la aldea: ' + error });
    }
  })


  //DELETE eliminar aldea
  app.delete("/api/aldeas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteAldea(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la aldea: ' + error });
    }
  })

  return app;
}