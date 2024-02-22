import Actividad from "../models/actividades.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetResultadoById } from "./resultados-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetSubresultadoById } from "./subresultados-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";

//Internos para validacion de claves unicas
async function validateUniquesActividades({id=null, nombre = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Actividad.exists(filter);
}

//Get internal
export async function privateGetActividadById(idActividad){
  try {
    return Actividad.findById(idActividad);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountActividades({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener actividades. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Actividades'] === false){
      return response.status(401).json({ error: 'Error al obtener Actividades. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Actividades']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Actividad.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedActividades({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Actividades. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Actividades'] === false){
      return response.status(401).json({ error: 'Error al obtener Actividades. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Actividades']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const actividades = await Actividad.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(actividades);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListActividades({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener actividades. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const actividades = await Actividad.find(filterQuery, '_id nombre descripcion').sort(sortQuery);

    response.json(actividades);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getActividadById(header, response, idActividad){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Actividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Actividades'] === false && rol.permisos.acciones['Actividades']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Actividades. No cuenta con los permisos suficientes.'});
    }

    const actividad = await Actividad.findById(idActividad).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(actividad);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones subresultado
export async function getRevisionesActividades(header, response, idActividad){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Actividad. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Actividades']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Actividad. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Actividad.find({original: {_id: idActividad}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear actividad
export async function createActividad(header, response, nombre, descripcion, idResultado, idSubresultado, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear la actividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Actividades']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Actividad. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear la actividad. Usuario no encontrado.' });

    const existentNombre = await validateUniquesActividades({nombre})
    if(existentNombre) return response.status(400).json({ error: `Error al crear la actividad. El código ${nombre} ya está en uso.` });

    const resultado = await privateGetResultadoById(idResultado)
    const subresultado = await privateGetSubresultadoById(idSubresultado)

    const baseActividad = new Actividad({
      //Propiedades de objeto
      nombre,
      descripcion,
      resultado,
      subresultado,
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

    await baseActividad.save();

    if(aprobar){
      const actividad = new Actividad({
        //Propiedades de objeto
        nombre,
        descripcion,
        resultado,
        subresultado,
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
      
      baseActividad.original = actividad._id;
      baseActividad.estado = 'Validado';
      baseActividad.fechaRevision = new Date();
      baseActividad.revisor = editor;

      await baseActividad.save();

      actividad.original = actividad._id;
      await actividad.save();
    }

    response.json(baseActividad);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editActividad(header, response, idActividad, nombre, descripcion, idResultado, idSubresultado, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar la actividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Actividades']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar la Actividad. No cuenta con los permisos suficientes.'});
    }

    const actividad = await privateGetActividadById(idActividad);
    if(!actividad) return response.status(404).json({ error: 'Error al editar la actividad. Actividad no encontrada' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar la actividad. Usuario no encontrado' });

    const existentNombre = await validateUniquesActividades({nombre, id: idActividad})
    if(existentNombre) return response.status(400).json({ error: `Error al editar la actividad. El código ${nombre} ya está en uso.` });

    const resultado = await privateGetResultadoById(idResultado);
    const subresultado = await privateGetSubresultadoById(idSubresultado);

    //Crear objeto de actualizacion
    const updateActividad = new Actividad({
      //Propiedades de objeto
      nombre,
      descripcion,
      resultado,
      subresultado,
      //Propiedades de control
      original: actividad._id,
      version: updateVersion(actividad.ultimaRevision),
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
      actividad.nombre = nombre;
      actividad.descripcion = descripcion;
      actividad.resultado = resultado;
      //Propiedades de control
      actividad.version = updateVersion(actividad.version, aprobar);
      actividad.ultimaRevision = actividad.version;
      actividad.fechaEdicion = new Date();
      actividad.editor = editor;
      actividad.fechaRevision = new Date();
      actividad.revisor = editor;
      actividad.observaciones = null;
    }
    else{
      actividad.pendientes = actividad.pendientes.concat(editor._id);
      actividad.ultimaRevision = updateVersion(actividad.ultimaRevision)
    }
  
    await updateActividad.save();
    await actividad.save();

    response.json(updateActividad);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateActividad(header, response, idActividad, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar la actividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Actividades']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar la Actividad. No cuenta con los permisos suficientes.'});
    }

    const updateActividad = await privateGetActividadById(idActividad);
    if(!updateActividad) return response.status(404).json({ error: 'Error al revisar la actividad. Revisión no encontrada.' });

    const original = await privateGetActividadById(updateActividad.original);
    if(!original && updateActividad.version !== '0.1') return response.status(404).json({ error: 'Error al revisar la actividad. Actividad no encontrada.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar la actividad. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateActividad.estado = 'Validado'
      updateActividad.fechaRevision = new Date();
      updateActividad.revisor = revisor;
      updateActividad.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateActividad.nombre;
        original.descripcion = updateActividad.descripcion;
        original.resultado = updateActividad.resultado;
        original.subresultado = updateActividad.subresultado,
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateActividad.fechaEdicion;
        original.editor = updateActividad.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const actividad = new Actividad({
          //Propiedades de objeto
          nombre: updateActividad.nombre,
          descripcion: updateActividad.descripcion,
          resultado: updateActividad.resultado,
          subresultado: updateActividad.subresultado,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateActividad.fechaEdicion,
          editor: updateActividad.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateActividad.original = actividad._id;
  
        await updateActividad.save();
  
        actividad.original = actividad._id;
        await actividad.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateActividad.estado = 'Rechazado'
      updateActividad.fechaRevision = new Date();
      updateActividad.revisor = revisor;
      updateActividad.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateActividad.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateActividad.save();

    response.json(updateActividad);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteActividad(header, response, idActividad, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar la actividad. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Actividades']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar la actividad. No cuenta con los permisos suficientes.'});
  }

  const actividad = await privateGetActividadById(idActividad);
  if(!actividad) return response.status(404).json({ error: 'Error al eliminar la actividad. Actividad no encontrada.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar la actividad. Usuario no encontrado.' });

  if(actividad.estado !== 'Eliminado'){
    actividad.estado = 'Eliminado'
    actividad.fechaEliminacion = new Date();
    actividad.eliminador = eliminador;
    actividad.observaciones = observaciones;
  }

  else{
    actividad.estado = 'Publicado'
    actividad.fechaEliminacion = null;
    actividad.eliminador = null;
    actividad.observaciones = null;
  }
  

  await actividad.save();

  response.json(actividad);
  return response;
}