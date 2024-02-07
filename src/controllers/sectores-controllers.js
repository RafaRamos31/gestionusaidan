import Sector from "../models/sectores.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetSectorById(idSector){
  try {
    return Sector.findById(idSector);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountSectores({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Sectores. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Sectores'] === false){
      return response.status(401).json({ error: 'Error al obtener Sectores. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Sectores']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Sector.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedSectores({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Sectores. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Sectores'] === false){
      return response.status(401).json({ error: 'Error al obtener Sectores. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Sectores']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const sectores = await Sector.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(sectores);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListSectores({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Sectores. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const sectores = await Sector.find(filterQuery, '_id nombre').sort(sortQuery);

    response.json(sectores);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getSectorById(header, response, idSector){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Sector. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Clientes']['Sectores'] === false && rol.permisos.acciones['Sectores']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Sector. No cuenta con los permisos suficientes.'});
    }

    const sector = await Sector.findById(idSector).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(sector);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones sector
export async function getRevisionesSector(header, response, idSector){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Sector. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sectores']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Sector. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Sector.find({original: {_id: idSector}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor',
      select: '_id nombre',
    }]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear sector
export async function createSector(header, response, nombre, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el sector. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sectores']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el sector. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el sector. Usuario no encontrado.' });

    const baseSector = new Sector({
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

    await baseSector.save();

    if(aprobar){
      const sector = new Sector({
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
      
      baseSector.original = sector._id;
      baseSector.estado = 'Validado';
      baseSector.fechaRevision = new Date();
      baseSector.revisor = editor;

      await baseSector.save();

      sector.original = sector._id;
      await sector.save();
    }

    response.json(baseSector);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editSector(header, response, idSector, nombre, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el sector. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sectores']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el sector. No cuenta con los permisos suficientes.'});
    }

    const sector = await privateGetSectorById(idSector);
    if(!sector) return response.status(404).json({ error: 'Error al editar el sector. Sector no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el sector. Usuario no encontrado' });

    //Crear objeto de actualizacion
    const updateSector = new Sector({
      //Propiedades de objeto
      nombre,
      //Propiedades de control
      original: sector._id,
      version: updateVersion(sector.ultimaRevision),
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
      sector.nombre = nombre;
      //Propiedades de control
      sector.version = updateVersion(sector.version, aprobar);
      sector.ultimaRevision = sector.version;
      sector.fechaEdicion = new Date();
      sector.editor = editor;
      sector.fechaRevision = new Date();
      sector.revisor = editor;
      sector.observaciones = null;
    }
    else{
      sector.pendientes = sector.pendientes.concat(editor._id);
      sector.ultimaRevision = updateVersion(sector.ultimaRevision)
    }
  
    await updateSector.save();
    await sector.save();

    response.json(updateSector);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateSector(header, response, idSector, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el sector. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sectores']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el sector. No cuenta con los permisos suficientes.'});
    }

    const updateSector = await privateGetSectorById(idSector);
    if(!updateSector) return response.status(404).json({ error: 'Error al revisar el sector. Revisión no encontrada.' });

    const original = await privateGetSectorById(updateSector.original);
    if(!original && updateSector.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el sector. Sector no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el sector. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateSector.estado = 'Validado'
      updateSector.fechaRevision = new Date();
      updateSector.revisor = revisor;
      updateSector.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateSector.nombre;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateSector.fechaEdicion;
        original.editor = updateSector.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const sector = new Sector({
          //Propiedades de objeto
          nombre: updateSector.nombre,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateSector.fechaEdicion,
          editor: updateSector.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateSector.original = sector._id;
  
        await updateSector.save();
  
        sector.original = sector._id;
        await sector.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateSector.estado = 'Rechazado'
      updateSector.fechaRevision = new Date();
      updateSector.revisor = revisor;
      updateSector.observaciones = observaciones;
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
    
    await updateSector.save();

    response.json(updateSector);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteSector(header, response, idSector, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el sector. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Sectores']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el sector. No cuenta con los permisos suficientes.'});
  }

  const sector = await privateGetSectorById(idSector);
  if(!sector) return response.status(404).json({ error: 'Error al eliminar el sector. Sector no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el sector. Usuario no encontrado.' });

  if(sector.estado !== 'Eliminado'){
    sector.estado = 'Eliminado'
    sector.fechaEliminacion = new Date();
    sector.eliminador = eliminador;
    sector.observaciones = observaciones;
  }

  else{
    sector.estado = 'Publicado'
    sector.fechaEliminacion = null;
    sector.eliminador = null;
    sector.observaciones = null;
  }
  

  await sector.save();

  response.json(sector);
  return response;
}