import { createCargo, deleteCargo, editCargo, getCargoById, getCountCargos, getListCargos, getPagedCargos, getRevisionesCargo, revisarUpdateCargo } from "../controllers/cargos-controller.js";

export const getCargosEndpoints = (app, upload) => {

  //GET count cargos
  app.post("/api/count/cargos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountCargos({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los cargos: ' + error });
    }
  })

  //POST Get PAGED cargos
  app.post("/api/paged/cargos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedCargos({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener los cargos: ' + error });
    }
  })


  //POST Get List cargos
  app.post("/api/list/cargos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListCargos({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los cargos: ' + error });
    }
  })


  //GET cargo by Id
  app.get("/api/cargo/:idCargo", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCargoById(
        authorizationHeader,
        response,
        request.params.idCargo
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el cargo: ' + error });
    }
  })


  //GET revisiones cargo
  app.get("/api/revisiones/cargo/:idCargo", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesCargo(
        authorizationHeader,
        response,
        request.params.idCargo
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del cargo: ' + error });
    }
  })


  //POST cargo
  app.post("/api/cargos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createCargo(
        authorizationHeader,
        response,
        request.body.nombre,
        request.body.idSector,
        JSON.parse(request.body.aprobar)
      );
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el cargo: ' + error });
    }
  })


  //PUT modificar cargo
  app.put("/api/cargos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editCargo(
        authorizationHeader,
        response,
        request.body.idCargo,
        request.body.nombre,
        request.body.idSector,
        JSON.parse(request.body.aprobar)
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el cargo: ' + error });
    }
  })


  //PUT revisar cargos
  app.put("/api/revisiones/cargos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateCargo(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar el cargo: ' + error });
    }
  })


  //DELETE eliminar cargo
  app.delete("/api/cargos", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteCargo(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el cargo: ' + error });
    }
  })

  return app;
}