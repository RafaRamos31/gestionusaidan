import TipoEvento from "../models/tiposEventos.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetTipoEventoById(idTipoEvento){
  try {
    return TipoEvento.findById(idTipoEvento);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountTiposEventos({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los Tipos de Evento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Tipos de Eventos'] === false){
      return response.status(401).json({ error: 'Error al obtener Tipos de Evento. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tipos de Eventos']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await TipoEvento.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedTiposEventos({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Tipos de Eventos. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Tipos de Eventos'] === false){
      return response.status(401).json({ error: 'Error al obtener Tipos de Eventos. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tipos de Eventos']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const tiposEventos = await TipoEvento.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(tiposEventos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListTiposEventos({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Tipos de Eventos. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const tiposEventos = await TipoEvento.find(filterQuery, '_id nombre').sort(sortQuery);

    response.json(tiposEventos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getTipoEventoById(header, response, idTipoEvento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Tipo de Evento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Configuración']['Tipos de Eventos'] === false && rol.permisos.acciones['Tipos de Eventos']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Tipo de Evento. No cuenta con los permisos suficientes.'});
    }

    const tipoEvento = await TipoEvento.findById(idTipoEvento).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(tipoEvento);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones sector
export async function getRevisionesTipoEvento(header, response, idTipoEvento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Tipo de Evento. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Eventos']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Tipo de Evento. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await TipoEvento.find({original: {_id: idTipoEvento}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor',
      select: '_id nombre',
    }]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear tipo de evento
export async function createTipoEvento(header, response, nombre, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el tipo de evento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Eventos']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el tipo de evento. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el tipo de evento. Usuario no encontrado.' });

    const baseTipoEvento = new TipoEvento({
      //Propiedades de objeto
      nombre,
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

    await baseTipoEvento.save();

    if(aprobar){
      const tipoEvento = new TipoEvento({
        //Propiedades de objeto
        nombre,
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
      
      baseTipoEvento.original = tipoEvento._id;
      baseTipoEvento.estado = 'Validado';
      baseTipoEvento.fechaRevision = new Date();
      baseTipoEvento.revisor = editor;

      await baseTipoEvento.save();

      tipoEvento.original = tipoEvento._id;
      await tipoEvento.save();
    }

    response.json(baseTipoEvento);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editTipoEvento(header, response, idTipoEvento, nombre, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el tipo de evento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Eventos']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el tipo de evento. No cuenta con los permisos suficientes.'});
    }

    const tipoEvento = await privateGetTipoEventoById(idTipoEvento);
    if(!tipoEvento) return response.status(404).json({ error: 'Error al editar el tipo de evento. Tipo de Evento no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el tipo de evento. Usuario no encontrado' });

    //Crear objeto de actualizacion
    const updateTipoEvento = new TipoEvento({
      //Propiedades de objeto
      nombre,
      //Propiedades de control
      original: tipoEvento._id,
      version: updateVersion(tipoEvento.ultimaRevision),
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
      tipoEvento.nombre = nombre;
      //Propiedades de control
      tipoEvento.version = updateVersion(tipoEvento.version, aprobar);
      tipoEvento.ultimaRevision = tipoEvento.version;
      tipoEvento.fechaEdicion = new Date();
      tipoEvento.editor = editor;
      tipoEvento.fechaRevision = new Date();
      tipoEvento.revisor = editor;
      tipoEvento.observaciones = null;
    }
    else{
      tipoEvento.pendientes = tipoEvento.pendientes.concat(editor._id);
      tipoEvento.ultimaRevision = updateVersion(tipoEvento.ultimaRevision)
    }
  
    await updateTipoEvento.save();
    await tipoEvento.save();

    response.json(updateTipoEvento);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateTipoEvento(header, response, idTipoEvento, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el tipo de evento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Eventos']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el tipo de evento. No cuenta con los permisos suficientes.'});
    }

    const updateTipoEvento = await privateGetTipoEventoById(idTipoEvento);
    if(!updateTipoEvento) return response.status(404).json({ error: 'Error al revisar el tipo de evento. Revisión no encontrada.' });

    const original = await privateGetTipoEventoById(updateTipoEvento.original);
    if(!original && updateTipoEvento.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el tipo de evento. Tipo de Evento no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el tipo de evento. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateTipoEvento.estado = 'Validado'
      updateTipoEvento.fechaRevision = new Date();
      updateTipoEvento.revisor = revisor;
      updateTipoEvento.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateTipoEvento.nombre;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateTipoEvento.fechaEdicion;
        original.editor = updateTipoEvento.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const tipoEvento = new TipoEvento({
          //Propiedades de objeto
          nombre: updateTipoEvento.nombre,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateTipoEvento.fechaEdicion,
          editor: updateTipoEvento.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateTipoEvento.original = tipoEvento._id;
  
        await updateTipoEvento.save();
  
        tipoEvento.original = tipoEvento._id;
        await tipoEvento.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateTipoEvento.estado = 'Rechazado'
      updateTipoEvento.fechaRevision = new Date();
      updateTipoEvento.revisor = revisor;
      updateTipoEvento.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateSector.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateTipoEvento.save();

    response.json(updateTipoEvento);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteTipoEvento(header, response, idTipoEvento, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el Tipo de Evento. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Tipos de Eventos']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el Tipo de Evento. No cuenta con los permisos suficientes.'});
  }

  const tipoEvento = await privateGetTipoEventoById(idTipoEvento);
  if(!tipoEvento) return response.status(404).json({ error: 'Error al eliminar el Tipo de Evento. Tipo de Evento no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el Tipo de Evento. Usuario no encontrado.' });

  if(tipoEvento.estado !== 'Eliminado'){
    tipoEvento.estado = 'Eliminado'
    tipoEvento.fechaEliminacion = new Date();
    tipoEvento.eliminador = eliminador;
    tipoEvento.observaciones = observaciones;
  }

  else{
    tipoEvento.estado = 'Publicado'
    tipoEvento.fechaEliminacion = null;
    tipoEvento.eliminador = null;
    tipoEvento.observaciones = null;
  }
  

  await tipoEvento.save();

  response.json(tipoEvento);
  return response;
}