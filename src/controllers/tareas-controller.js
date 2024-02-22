import Tarea from "../models/tareas.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetActividadById } from "./actividades-controller.js";
import { privateGetIndicadorById } from "./indicadores-controller.js";
import { privateGetResultadoById } from "./resultados-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetSubActividadById } from "./subactividades-controller.js";
import { privateGetSubresultadoById } from "./subresultados-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetTareaById(idTarea){
  try {
    return Tarea.findById(idTarea);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountTareas({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener las tareas. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Tareas'] === false){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tareas']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Tarea.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedTareas({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Tareas. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Tareas'] === false){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tareas']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const tareas = await Tarea.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
    {
      path: 'editor revisor eliminador componente',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado actividad subactividad',
      select: '_id nombre descripcion',
    },
    {
      path: 'year trimestre',
      select: '_id nombre fechaInicio fechaFinal',
    },
  ]);

    response.json(tareas);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListTareas({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener las tareas. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const tareas = await Tarea.find(filterQuery, '_id nombre').sort(sortQuery);

    response.json(tareas);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getTareaById(header, response, idTarea){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener la Tarea. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Tareas'] === false && rol.permisos.acciones['Tareas']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }

    const tarea = await Tarea.findById(idTarea).populate([{
      path: 'editor revisor eliminador componente',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado actividad subactividad',
      select: '_id nombre descripcion',
    },
    {
      path: 'year trimestre',
      select: '_id nombre fechaInicio fechaFinal',
    },
  ]);

    response.json(tarea);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones 
export async function getRevisionesTarea(header, response, idTarea){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de la Tarea. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Tareas. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Tarea.find({original: {_id: idTarea}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor eliminador componente',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado actividad subactividad',
      select: '_id nombre descripcion',
    },
    {
      path: 'year trimestre',
      select: '_id nombre fechaInicio fechaFinal',
    },
  ]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear tarea
export async function createTarea({header, response, nombre, descripcion, idResultado, idSubresultado, idActividad, idSubActividad, medida, 
  cantidadProgramada, idIndicadorPrincipal, indicadoresSecundarios, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear la tarea. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Tarea. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear la tarea. Usuario no encontrado.' });

    const resultado = await privateGetResultadoById(idResultado)
    const subresultado = await privateGetSubresultadoById(idSubresultado)
    const actividad = await privateGetActividadById(idActividad)
    const subactividad = await privateGetSubActividadById(idSubActividad)

    const indicadorPrincipal = await privateGetIndicadorById(idIndicadorPrincipal)

    const baseTarea = new Tarea({
      //Propiedades de objeto
      nombre,
      resultado,
      subresultado,
      actividad,
      subactividad,
      medida,
      cantidadProgramada,
      cantidadRealizada: 0,
      indicadorPrincipal,
      indicadoresSecundarios,
      //Propiedades de control
      original: null,
      version: '0.1',
      ultimaRevision: '0.1',
      estado: 'En revisión',
      fechaEdicion: new Date(),
      editor,
      fechaRevision: null,
      revisor: null,
      fechaEliminacion: null,
      eliminador: null,
      observaciones: null,
      pendientes: []
    })

    await baseTarea.save();

    if(aprobar){
      const tarea = new Tarea({
        //Propiedades de objeto
        nombre,
        resultado,
        subresultado,
        actividad,
        subactividad,
        medida,
        cantidadProgramada,
        cantidadRealizada: 0,
        indicadorPrincipal,
        indicadoresSecundarios,
        //Propiedades de control
        original: null,
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        fechaEdicion: new Date(),
        editor,
        fechaRevision: new Date(),
        revisor: editor,
        fechaEliminacion: null,
        eliminador: null,
        observaciones: null,
        pendientes: []
      })
      
      baseTarea.original = tarea._id;
      baseTarea.estado = 'Validado';
      baseTarea.fechaRevision = new Date();
      baseTarea.revisor = editor;

      await baseTarea.save();

      tarea.original = tarea._id;
      await tarea.save();
    }

    response.json(baseTarea);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editTarea({header, response, nombre, idTarea, idResultado, idSubresultado, idActividad, idSubActividad, medida, 
  cantidadProgramada, idIndicadorPrincipal, indicadoresSecundarios, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar la tarea. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar Tarea. No cuenta con los permisos suficientes.'});
    }

    const tarea = await privateGetTareaById(idTarea);
    if(!tarea) return response.status(404).json({ error: 'Error al editar la tarea. Tarea no encontrada' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar la tarea. Usuario no encontrado' });

    const resultado = await privateGetResultadoById(idResultado);
    const subresultado = await privateGetSubresultadoById(idSubresultado);
    const actividad = await privateGetActividadById(idActividad);
    const subactividad = await privateGetSubActividadById(idSubActividad);

    const indicadorPrincipal = await privateGetIndicadorById(idIndicadorPrincipal);

    //Crear objeto de actualizacion
    const updateTarea = new Tarea({
      //Propiedades de objeto
      nombre,
      resultado,
      subresultado,
      actividad,
      subactividad,
      medida,
      cantidadProgramada,
      cantidadRealizada: tarea.cantidadRealizada,
      indicadorPrincipal,
      indicadoresSecundarios,
      //Propiedades de control
      original: tarea._id,
      version: updateVersion(tarea.ultimaRevision),
      estado: aprobar ? 'Validado' : 'En revisión',
      fechaEdicion: new Date(),
      editor: editor,
      fechaRevision: aprobar ? new Date() : null,
      revisor: aprobar ? editor : null,
      fechaEliminacion: null,
      eliminador: null,
      observaciones: null,
      pendientes: []
    })
  
    if(aprobar){
      //Actualizar objeto publico
      //Propiedades de objeto
      tarea.nombre = nombre;
      tarea.resultado = resultado;
      tarea.subresultado = subresultado;
      tarea.actividad = actividad;
      tarea.subactividad = resultado;
      tarea.medida = medida,
      tarea.cantidadProgramada = cantidadProgramada,
      tarea.indicadorPrincipal = indicadorPrincipal,
      tarea.indicadoresSecundarios = indicadoresSecundarios,
      //Propiedades de control
      tarea.version = updateVersion(tarea.version, aprobar);
      tarea.ultimaRevision = tarea.version;
      tarea.fechaEdicion = new Date();
      tarea.editor = editor;
      tarea.fechaRevision = new Date();
      tarea.revisor = editor;
      tarea.observaciones = null;
    }
    else{
      tarea.pendientes = tarea.pendientes.concat(editor._id);
      tarea.ultimaRevision = updateVersion(tarea.ultimaRevision)
    }
  
    await updateTarea.save();
    await tarea.save();

    response.json(updateTarea);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateTarea(header, response, idTarea, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar la tarea. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Tarea. No cuenta con los permisos suficientes.'});
    }

    const updateTarea = await privateGetTareaById(idTarea);
    if(!updateTarea) return response.status(404).json({ error: 'Error al revisar la tarea. Revisión no encontrada.' });

    const original = await privateGetTareaById(updateTarea.original);
    if(!original && updateTarea.version !== '0.1') return response.status(404).json({ error: 'Error al revisar la tarea. Tarea no encontrada.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar la tarea. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateTarea.estado = 'Validado'
      updateTarea.fechaRevision = new Date();
      updateTarea.revisor = revisor;
      updateTarea.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateTarea.nombre;
        original.resultado = updateTarea.resultado;
        original.subresultado = updateTarea.subresultado,
        original.actividad = updateTarea.actividad,
        original.subactividad = updateTarea.subactividad,
        original.medida = updateTarea.medida,
        original.cantidadProgramada = updateTarea.cantidadProgramada,
        original.indicadorPrincipal = updateTarea.indicadorPrincipal,
        original.indicadoresSecundarios = updateTarea.indicadoresSecundarios,
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateTarea.fechaEdicion;
        original.editor = updateTarea.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const tarea = new Tarea({
          //Propiedades de objeto
          nombre: updateTarea.nombre,
          resultado: updateTarea.resultado,
          subresultado: updateTarea.subresultado,
          actividad: updateTarea.actividad,
          subactividad: updateTarea.subactividad,
          medida: updateTarea.medida,
          cantidadProgramada: updateTarea.cantidadProgramada,
          cantidadRealizada: 0,
          indicadorPrincipal: updateTarea.indicadorPrincipal,
          indicadoresSecundarios: updateTarea.indicadoresSecundarios,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateTarea.fechaEdicion,
          editor: updateTarea.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateTarea.original = tarea._id;
  
        await updateTarea.save();
  
        tarea.original = tarea._id;
        await tarea.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateTarea.estado = 'Rechazado'
      updateTarea.fechaRevision = new Date();
      updateTarea.revisor = revisor;
      updateTarea.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateTarea.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateTarea.save();

    response.json(updateTarea);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteTarea(header, response, idTarea, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar la tarea. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Tareas']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar Tarea. No cuenta con los permisos suficientes.'});
  }

  const tarea = await privateGetTareaById(idTarea);
  if(!tarea) return response.status(404).json({ error: 'Error al eliminar la tarea. Tarea no encontrada.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar la tarea. Usuario no encontrado.' });

  if(tarea.estado !== 'Eliminado'){
    tarea.estado = 'Eliminado'
    tarea.fechaEliminacion = new Date();
    tarea.eliminador = eliminador;
    tarea.observaciones = observaciones;
  }

  else{
    tarea.estado = 'Publicado'
    tarea.fechaEliminacion = null;
    tarea.eliminador = null;
    tarea.observaciones = null;
  }

  await tarea.save();

  response.json(tarea);
  return response;
}