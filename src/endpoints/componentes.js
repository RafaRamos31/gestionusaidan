import { createComponente, deleteComponente, editComponente, getComponentesById, getCountComponentes, getListComponentes, getPagedComponentes, getRevisionesComponente, revisarUpdateComponente } from "../controllers/componentes-controller.js";

export const getComponentesEndpoints = (app, upload) => {

  //GET count componentes
  app.post("/api/count/componentes", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountComponentes({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los componentes: ' + error });
    }
  })

  //POST Get PAGED componentes
  app.post("/api/paged/componentes", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedComponentes({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los componentes: ' + error });
    }
  })


  //POST Get List componentes
  app.post("/api/list/componentes", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListComponentes({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los componentes: ' + error });
    }
  })


  //GET componente by Id
  app.get("/api/componente/:idComponente", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getComponentesById(
        authorizationHeader,
        response,
        request.params.idComponente
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el componente: ' + error });
    }
  })
  

  //GET revisiones componente
  app.get("/api/revisiones/componente/:idComponente", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesComponente(
        authorizationHeader,
        response,
        request.params.idComponente
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del componente: ' + error });
    }
  })


  //POST sector
  app.post("/api/componentes", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createComponente(
        authorizationHeader,
        response,
        request.body.nombre,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el componente: ' + error });
    }
  })

  //PUT modificar componente
  app.put("/api/componentes", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editComponente(
        authorizationHeader,
        response,
        request.body.idComponente,
        request.body.nombre,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el componente: ' + error });
    }
  })

  //PUT revisar componente
  app.put("/api/revisiones/componentes", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateComponente(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el componente: ' + error });
    }
  })


  //DELETE eliminar componentes
  app.delete("/api/componentes", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteComponente(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el componente: ' + error });
    }
  })

  return app;
}