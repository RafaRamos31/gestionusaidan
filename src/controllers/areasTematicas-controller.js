import AreaTematica from "../models/areasTematicas.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Internos para validacion de claves unicas
async function validateUniquesAreaTematica({id=null, nombre = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return AreaTematica.exists(filter);
}

//Get internal
export async function privateGetAreaTematicaById(idAreaTematica){
  try {
    return AreaTematica.findById(idAreaTematica);
  } catch (error) {
    throw error;
  }
}

//Get Count
export async function getCountAreasTematicas({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Áreas Temáticas. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Indicadores']['Áreas Temáticas'] === false){
      return response.status(401).json({ error: 'Error al obtener Áreas Temáticas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Áreas Temáticas']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await AreaTematica.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedAreasTematicas({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Áreas Temáticas. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Indicadores']['Áreas Temáticas'] === false){
      return response.status(401).json({ error: 'Error al obtener Áreas Temáticas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Áreas Temáticas']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const areasTematicas = await AreaTematica.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
        path: 'indicadores',
        select: '_id nombre descripcion',
      },
    ]);

    response.json(areasTematicas);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListAreasTematicas({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Áreas temáticas. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const areasTematicas = await AreaTematica.find(filterQuery, '_id nombre descripcion').sort(sortQuery);

    response.json(areasTematicas);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getAreaTematicaById(header, response, idAreaTematica){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Área Temática. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Indicadores']['Áreas Temáticas'] === false && rol.permisos.acciones['Áreas Temáticas']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Áreas Temáticas. No cuenta con los permisos suficientes.'});
    }

    const areaTematica = await AreaTematica.findById(idAreaTematica).populate([
      {
        path: 'editor revisor eliminador',
        select: '_id nombre',
      },
      {
        path: 'indicadores',
        select: '_id nombre descripcion',
      }
    ]);

    response.json(areaTematica);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones 
export async function getRevisionesAreaTematica(header, response, idAreaTematica){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Área Temática. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Áreas Temáticas']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Áreas Temáticas. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await AreaTematica.find({original: {_id: idAreaTematica}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor',
      select: '_id nombre',
    }]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear 
export async function createAreaTematica(header, response, nombre, descripcion, indicadores, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el Área temática. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Áreas Temáticas']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el Área temática. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el Área temática. Usuario no encontrado.' });

    const existentCodigo = await validateUniquesAreaTematica({nombre})
    if(existentCodigo) return response.status(400).json({ error: `Error al crear el Área temática. El código ${nombre} ya está en uso.` });

    const baseAreaTematica = new AreaTematica({
      //Propiedades de objeto
      nombre,
      descripcion,
      indicadores,
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

    await baseAreaTematica.save();

    if(aprobar){
      const areaTematica = new AreaTematica({
        //Propiedades de objeto
        nombre,
        descripcion,
        indicadores,
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
      
      baseAreaTematica.original = areaTematica._id;
      baseAreaTematica.estado = 'Validado';
      baseAreaTematica.fechaRevision = new Date();
      baseAreaTematica.revisor = editor;

      await baseAreaTematica.save();

      areaTematica.original = areaTematica._id;
      await areaTematica.save();
    }

    response.json(baseAreaTematica);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editAreaTematica(header, response, idAreaTematica, nombre, descripcion, indicadores, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el área temática. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Áreas Temáticas']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el área temática. No cuenta con los permisos suficientes.'});
    }

    const areaTematica = await privateGetAreaTematicaById(idAreaTematica);
    if(!areaTematica) return response.status(404).json({ error: 'Error al editar el área temática. Área Temática no encontrada' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el área temática. Usuario no encontrado' });

    const existentCodigo = await validateUniquesAreaTematica({nombre, id: idAreaTematica})
    if(existentCodigo) return response.status(400).json({ error: `Error al editar el área temática. El código ${nombre} ya está en uso.` });

    //Crear objeto de actualizacion
    const updateAreaTematica = new AreaTematica({
      //Propiedades de objeto
      nombre,
      descripcion,
      indicadores,
      //Propiedades de control
      original: areaTematica._id,
      version: updateVersion(areaTematica.ultimaRevision),
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
      areaTematica.nombre = nombre;
      areaTematica.descripcion = descripcion;
      areaTematica.indicadores = indicadores;
      //Propiedades de control
      areaTematica.version = updateVersion(areaTematica.version, aprobar);
      areaTematica.ultimaRevision = areaTematica.version;
      areaTematica.fechaEdicion = new Date();
      areaTematica.editor = editor;
      areaTematica.fechaRevision = new Date();
      areaTematica.revisor = editor;
      areaTematica.observaciones = null;
    }
    else{
      areaTematica.pendientes = areaTematica.pendientes.concat(editor._id);
      areaTematica.ultimaRevision = updateVersion(areaTematica.ultimaRevision)
    }
  
    await updateAreaTematica.save();
    await areaTematica.save();

    response.json(updateAreaTematica);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateAreaTematica(header, response, idAreaTematica, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el Área Temática. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Áreas Temáticas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el Área Temática. No cuenta con los permisos suficientes.'});
    }

    const updateAreaTematica = await privateGetAreaTematicaById(idAreaTematica);
    if(!updateAreaTematica) return response.status(404).json({ error: 'Error al revisar el Área Temática. Revisión no encontrada.' });

    const original = await privateGetAreaTematicaById(updateAreaTematica.original);
    if(!original && updateAreaTematica.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el Área Temática. Área Temática no encontrada.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el Área Temática. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateAreaTematica.estado = 'Validado'
      updateAreaTematica.fechaRevision = new Date();
      updateAreaTematica.revisor = revisor;
      updateAreaTematica.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateAreaTematica.nombre;
        original.descripcion = updateAreaTematica.descripcion;
        original.indicadores = updateAreaTematica.indicadores;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateAreaTematica.fechaEdicion;
        original.editor = updateAreaTematica.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const areaTematica = new AreaTematica({
          //Propiedades de objeto
          nombre: updateAreaTematica.nombre,
          descripcion: updateAreaTematica.descripcion,
          indicadores: updateAreaTematica.indicadores,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateAreaTematica.fechaEdicion,
          editor: updateAreaTematica.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateAreaTematica.original = areaTematica._id;
  
        await updateAreaTematica.save();
  
        areaTematica.original = areaTematica._id;
        await areaTematica.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateAreaTematica.estado = 'Rechazado'
      updateAreaTematica.fechaRevision = new Date();
      updateAreaTematica.revisor = revisor;
      updateAreaTematica.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateAreaTematica.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateAreaTematica.save();

    response.json(updateAreaTematica);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteAreaTematica(header, response, idAreaTematica, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el área temática. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Áreas Temáticas']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el área temática. No cuenta con los permisos suficientes.'});
  }

  const areaTematica = await privateGetAreaTematicaById(idAreaTematica);
  if(!areaTematica) return response.status(404).json({ error: 'Error al eliminar el área temática. Área Temática no encontrada.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el área temática. Usuario no encontrado.' });

  if(areaTematica.estado !== 'Eliminado'){
    areaTematica.estado = 'Eliminado'
    areaTematica.fechaEliminacion = new Date();
    areaTematica.eliminador = eliminador;
    areaTematica.observaciones = observaciones;
  }

  else{
    areaTematica.estado = 'Publicado'
    areaTematica.fechaEliminacion = null;
    areaTematica.eliminador = null;
    areaTematica.observaciones = null;
  }
  

  await areaTematica.save();

  response.json(areaTematica);
  return response;
}