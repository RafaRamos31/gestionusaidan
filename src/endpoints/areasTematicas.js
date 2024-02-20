import { createAreaTematica, deleteAreaTematica, editAreaTematica, getAreaTematicaById, getCountAreasTematicas, getListAreasTematicas, getPagedAreasTematicas, getRevisionesAreaTematica, revisarUpdateAreaTematica } from "../controllers/areasTematicas-controller.js";

export const getAreasTematicasEndpoints = (app, upload) => {

  //GET count departamentos
  app.post("/api/count/areastematicas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountAreasTematicas({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las Áreas Temáticas: ' + error });
    }
  })

  //POST Get PAGED
  app.post("/api/paged/areastematicas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedAreasTematicas({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener las Áreas Temáticas: ' + error });
    }
  })


  //POST Get List 
  app.post("/api/list/areastematicas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListAreasTematicas({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las Áreas Temáticas: ' + error });
    }
  })


  //GET by Id
  app.get("/api/areatematica/:idAreaTematica", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getAreaTematicaById(
        authorizationHeader,
        response,
        request.params.idAreaTematica
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el área temática: ' + error });
    }
  })
  

  //GET revisiones 
  app.get("/api/revisiones/areatematica/:idAreaTematica", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesAreaTematica(
        authorizationHeader,
        response,
        request.params.idAreaTematica
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del Área Temática: ' + error });
    }
  })


  //POST 
  app.post("/api/areastematicas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createAreaTematica(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.descripcion,
        JSON.parse(request.body.indicadores)?.data,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el Área Temática: ' + error });
    }
  })

  //PUT modificar
  app.put("/api/areastematicas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editAreaTematica(
        authorizationHeader,
        response,
        request.body.idAreaTematica,
        request.body.nombre,
        request.body.descripcion,
        JSON.parse(request.body.indicadores)?.data,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el Área Temática: ' + error });
    }
  })

  //PUT revisar 
  app.put("/api/revisiones/areastematicas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateAreaTematica(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el Área Temática: ' + error });
    }
  })


  //DELETE eliminar 
  app.delete("/api/areastematicas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteAreaTematica(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el Área Temática: ' + error });
    }
  })

  return app;
}