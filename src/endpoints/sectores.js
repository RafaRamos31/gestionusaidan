import { createSector, deleteSector, editSector, getCountSectores, getListSectores, getPagedSectores, getRevisionesSector, getSectorById, revisarUpdateSector } from "../controllers/sectores-controllers.js";

export const getSectoresEndpoints = (app, upload) => {

  //GET count sectores
  app.post("/api/count/sectores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountSectores({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los sectores: ' + error });
    }
  })

  //POST Get PAGED sectores
  app.post("/api/paged/sectores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedSectores({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los sectores: ' + error });
    }
  })


  //POST Get List sectores
  app.post("/api/list/sectores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListSectores({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los sectores: ' + error });
    }
  })


  //GET departamento by Id
  app.get("/api/sector/:idSector", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getSectorById(
        authorizationHeader,
        response,
        request.params.idSector
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el sector: ' + error });
    }
  })
  

  //GET revisiones sectores
  app.get("/api/revisiones/sector/:idSector", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesSector(
        authorizationHeader,
        response,
        request.params.idSector
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del sector: ' + error });
    }
  })


  //POST sector
  app.post("/api/sectores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createSector(
        authorizationHeader,
        response,
        request.body.nombre,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el sector: ' + error });
    }
  })

  //PUT modificar sectores
  app.put("/api/sectores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editSector(
        authorizationHeader,
        response,
        request.body.idSector,
        request.body.nombre,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el sector: ' + error });
    }
  })

  //PUT revisar sector
  app.put("/api/revisiones/sectores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateSector(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el sector: ' + error });
    }
  })


  //DELETE eliminar sectores
  app.delete("/api/sectores", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteSector(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Sector: ' + error });
    }
  })

  return app;
}