import { createTarea, deleteTarea, editTarea, getCountTareas, getListTareas, getPagedTareas, getRevisionesTarea, getTareaById, revisarUpdateTarea } from "../controllers/tareas-controller.js";

export const getTareasEndpoints = (app, upload) => {

  //GET count
  app.post("/api/count/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountTareas({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las tareas: ' + error });
    }
  })

  //POST Get PAGED
  app.post("/api/paged/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedTareas({
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
      response.status(500).json({ error: 'Ocurrió un error al obtener las tareas: ' + error });
    }
  })


  //POST Get List 
  app.post("/api/list/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListTareas({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las tareas: ' + error });
    }
  })


  //GET tarea by Id
  app.get("/api/tarea/:idTarea", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getTareaById(
        authorizationHeader,
        response,
        request.params.idTarea
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener la tarea: ' + error });
    }
  })
  

  //GET revisiones 
  app.get("/api/revisiones/tarea/:idTarea", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesTarea(
        authorizationHeader,
        response,
        request.params.idTarea
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones de la tarea: ' + error });
    }
  })


  //POST resultado
  app.post("/api/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createTarea({
        header: authorizationHeader,
        response,
        idComponente: request.body.idComponente,
        idSubActividad: request.body.idSubActividad,
        nombre: request.body.nombre,
        titulo: request.body.titulo,
        descripcion: request.body.descripcion,
        idYear: request.body.idYear,
        idQuarter: request.body.idQuarter,
        lugar: request.body.lugar,
        unidadMedida: request.body.unidadMedida,
        gastosEstimados: request.body.gastosEstimados,
        cantidadProgramada: request.body.cantidadProgramada,
        aprobar: JSON.parse(request.body.aprobar)
    });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar la tarea: ' + error });
    }
  })

  //PUT modificar tarea
  app.put("/api/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editTarea({
        header: authorizationHeader,
        response,
        idTarea: request.body.idTarea,
        idComponente: request.body.idComponente,
        idSubActividad: request.body.idSubActividad,
        nombre: request.body.nombre,
        titulo: request.body.titulo,
        descripcion: request.body.descripcion,
        idYear: request.body.idYear,
        idQuarter: request.body.idQuarter,
        lugar: request.body.lugar,
        unidadMedida: request.body.unidadMedida,
        gastosEstimados: request.body.gastosEstimados,
        cantidadProgramada: request.body.cantidadProgramada,
        aprobar: JSON.parse(request.body.aprobar)
    });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar la tarea: ' + error });
    }
  })

  //PUT revisar tarea
  app.put("/api/revisiones/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateTarea(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar la tarea: ' + error });
    }
  })


  //DELETE eliminar resultado
  app.delete("/api/tareas", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteTarea(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar la tarea: ' + error });
    }
  })

  return app;
}