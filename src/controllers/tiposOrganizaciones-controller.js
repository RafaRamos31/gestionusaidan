import TipoOrganizacion from "../models/tiposOrganizaciones.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetSectorById } from "./sectores-controllers.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetTipoOrganizacionById(idTipoOrganizacion){
  try {
    return TipoOrganizacion.findById(idTipoOrganizacion).populate([
      {
      path: 'sector',
      select: '_id nombre',
      },
    ]);
  } catch (error) {
    throw error;
  }
}

//Get Count
export async function getCountTiposOrganizaciones({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los Tipos de Organizaciones. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Tipos de Organizaciones'] === false){
      return response.status(401).json({ error: 'Error al obtener los Tipos de Organizaciones. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tipos de Organizaciones']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await TipoOrganizacion.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedTiposOrganizaciones({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los Tipos de Organizaciones. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Tipos de Organizaciones'] === false){
      return response.status(401).json({ error: 'Error al obtener los Tipos de Organizaciones. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tipos de Organizaciones']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const tiposOrganizaciones = await TipoOrganizacion.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'sector',
      select: '_id nombre',
      },
    ]);

    response.json(tiposOrganizaciones);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListTiposOrganizaciones({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los Tipos de Organizaciones. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const tiposOrganizaciones = await TipoOrganizacion.find(filterQuery, '_id nombre').sort(sortQuery);

    response.json(tiposOrganizaciones);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getTipoOrganizacionById(header, response, idTipoOrganizacion){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener el Tipo de Organización. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Clientes']['Tipos de Organizaciones'] === false && rol.permisos.acciones['Tipos de Organizaciones']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener los Tipos de Organizaciones. No cuenta con los permisos suficientes.'});
    }

    const tipoOrganizacion = await TipoOrganizacion.findById(idTipoOrganizacion).populate([
    {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'sector',
      select: '_id nombre',
      },
    ]);

    response.json(tipoOrganizacion);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones municipio
export async function getRevisionesTipoOrganizacion(header, response, idTipoOrganizacion){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Tipo de Organización. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Organizaciones']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Tipo de Organizaciones. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await TipoOrganizacion.find({original: {_id: idTipoOrganizacion}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([
    {
      path: 'editor revisor eliminador sector',
      select: '_id nombre',
    }]);
    
    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear tipo de organizacion
export async function createTipoOrganizacion(header, response, nombre, idSector, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el tipo de organización. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Organizaciones']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el tipo de organización. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el tipo de organización. Usuario no encontrado.' });

    const sector = await privateGetSectorById(idSector);
    if(!sector) return response.status(404).json({ error: 'Error al crear el tipo de organización. Sector no encontrado.' });
    
    const baseTipoOrganizacion = new TipoOrganizacion({
      //Propiedades de objeto
      nombre,
      sector,
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

    await baseTipoOrganizacion.save();

    if(aprobar){
      const tipoOrganizacion = new TipoOrganizacion({
        //Propiedades de objeto
        nombre,
        sector,
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
      
      baseTipoOrganizacion.original = tipoOrganizacion._id;
      baseTipoOrganizacion.estado = 'Validado';
      baseTipoOrganizacion.fechaRevision = new Date();
      baseTipoOrganizacion.revisor = editor;

      await baseTipoOrganizacion.save();

      tipoOrganizacion.original = tipoOrganizacion._id;
      await tipoOrganizacion.save();
    }

    response.json(baseTipoOrganizacion);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editTipoOrganizacion(header, response, idTipoOrganizacion, nombre, idSector, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el tipo de organización. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Organizaciones']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el tipo de organización. No cuenta con los permisos suficientes.'});
    }

    const tipoOrganizacion = await privateGetTipoOrganizacionById(idTipoOrganizacion);
    if(!tipoOrganizacion) return response.status(404).json({ error: 'Error al editar el tipo de organización. Tipo de Organización no encontrado.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el tipo de organización. Usuario no encontrado.' });

    const sector = await privateGetSectorById(idSector);
    if(!sector) return response.status(404).json({ error: 'Error al editar el tipo de organización. Sector no encontrado.' });
    
    //Crear objeto de actualizacion
    const updateTipoOrganizacion = new TipoOrganizacion({
      //Propiedades de objeto
      nombre,
      sector,
      //Propiedades de control
      original: tipoOrganizacion._id,
      version: updateVersion(tipoOrganizacion.ultimaRevision),
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
      tipoOrganizacion.nombre = nombre;
      tipoOrganizacion.sector = sector;
      //Propiedades de control
      tipoOrganizacion.version = updateVersion(tipoOrganizacion.version, aprobar);
      tipoOrganizacion.ultimaRevision = tipoOrganizacion.version;
      tipoOrganizacion.fechaEdicion = new Date();
      tipoOrganizacion.editor = editor;
      tipoOrganizacion.fechaRevision = new Date();
      tipoOrganizacion.revisor = editor;
      tipoOrganizacion.observaciones = null;
    }
    else{
      tipoOrganizacion.pendientes = tipoOrganizacion.pendientes.concat(editor._id);
      tipoOrganizacion.ultimaRevision = updateVersion(tipoOrganizacion.ultimaRevision)
    }
  
    await updateTipoOrganizacion.save();
    await tipoOrganizacion.save();

    response.json(updateTipoOrganizacion);
    return response;

  } catch (error) {
    throw error;
  }
}



//Review
export async function revisarUpdateTipoOrganizacion(header, response, idTipoOrganizacion, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el tipo de organización. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tipos de Organizaciones']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el tipo de organización. No cuenta con los permisos suficientes.'});
    }

    const updateTipoOrganizacion = await privateGetTipoOrganizacionById(idTipoOrganizacion);
    if(!updateTipoOrganizacion) return response.status(404).json({ error: 'Error al revisar el tipo de organización. Revisión no encontrada.' });

    const original = await privateGetTipoOrganizacionById(updateTipoOrganizacion.original);
    if(!original && updateTipoOrganizacion.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el tipo de organización. Tipo de Organización no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el tipo de organización. Usuario no encontrado.' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateTipoOrganizacion.estado = 'Validado'
      updateTipoOrganizacion.fechaRevision = new Date();
      updateTipoOrganizacion.revisor = revisor;
      updateTipoOrganizacion.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateTipoOrganizacion.nombre;
        original.sector = updateTipoOrganizacion.sector;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateTipoOrganizacion.fechaEdicion;
        original.editor = updateTipoOrganizacion.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const tipoOrganizacion = new TipoOrganizacion({
          //Propiedades de objeto
          nombre: updateTipoOrganizacion.nombre,
          sector: updateTipoOrganizacion.sector,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateTipoOrganizacion.fechaEdicion,
          editor: updateTipoOrganizacion.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateTipoOrganizacion.original = tipoOrganizacion._id;
  
        await updateTipoOrganizacion.save();
  
        tipoOrganizacion.original = tipoOrganizacion._id;
        await tipoOrganizacion.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateTipoOrganizacion.estado = 'Rechazado'
      updateTipoOrganizacion.fechaRevision = new Date();
      updateTipoOrganizacion.revisor = revisor;
      updateTipoOrganizacion.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateTipoOrganizacion.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateTipoOrganizacion.save();

    response.json(updateTipoOrganizacion);
    return response;
    
  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteTipoOrganizacion(header, response, idTipoOrganizacion, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el tipo de organización. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Tipos de Organizaciones']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el tipo de organizaciones. No cuenta con los permisos suficientes.'});
  }

  const tipoOrganizacion = await privateGetTipoOrganizacionById(idTipoOrganizacion);
  if(!tipoOrganizacion) return response.status(404).json({ error: 'Error al eliminar el tipo de organización. Tipo de Organización no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el tipo de organización. Usuario no encontrado.' });

  if(tipoOrganizacion.estado !== 'Eliminado'){
    tipoOrganizacion.estado = 'Eliminado'
    tipoOrganizacion.fechaEliminacion = new Date();
    tipoOrganizacion.eliminador = eliminador;
    tipoOrganizacion.observaciones = observaciones;
  }

  else{
    tipoOrganizacion.estado = 'Publicado'
    tipoOrganizacion.fechaEliminacion = null;
    tipoOrganizacion.eliminador = null;
    tipoOrganizacion.observaciones = null;
  }
  

  await tipoOrganizacion.save();

  response.json(tipoOrganizacion);
  return response;
}