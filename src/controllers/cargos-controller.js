import Cargo from "../models/cargos.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetSectorById } from "./sectores-controllers.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetCargoById(idCargo){
  try {
    return Cargo.findById(idCargo).populate([
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
export async function getCountCargos({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los Cargos. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Cargos'] === false){
      return response.status(401).json({ error: 'Error al obtener los Cargos. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Cargos']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Cargo.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedCargos({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los Cargos. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Cargos'] === false){
      return response.status(401).json({ error: 'Error al obtener los Cargos. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Cargos']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const cargos = await Cargo.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'editor revisor eliminador sector',
      select: '_id nombre',
      }
    ]);

    response.json(cargos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListCargos({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los Cargos. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({sort, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const cargos = await Cargo.find(filterQuery, '_id nombre').sort(sortQuery);

    response.json(cargos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getCargoById(header, response, idCargo){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener el Cargo. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Clientes']['Cargos'] === false && rol.permisos.acciones['Cargos']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener el Cargo. No cuenta con los permisos suficientes.'});
    }

    const cargo = await Cargo.findById(idCargo).populate([
    {
      path: 'editor revisor eliminador sector',
      select: '_id nombre',
    }]);

    response.json(cargo);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones cargo
export async function getRevisionesCargo(header, response, idCargo){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Cargo. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Cargos']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Cargo. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Cargo.find({original: {_id: idCargo}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([
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

//Crear cargo
export async function createCargo(header, response, nombre, idSector, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el cargo. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Cargos']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el cargo. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el cargo. Usuario no encontrado.' });

    const sector = await privateGetSectorById(idSector);
    if(!sector) return response.status(404).json({ error: 'Error al crear el cargo. Sector no encontrado.' });
    
    const baseCargo = new Cargo({
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

    await baseCargo.save();

    if(aprobar){
      const cargo = new Cargo({
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
      
      baseCargo.original = cargo._id;
      baseCargo.estado = 'Validado';
      baseCargo.fechaRevision = new Date();
      baseCargo.revisor = editor;

      await baseCargo.save();

      cargo.original = cargo._id;
      await cargo.save();
    }

    response.json(baseCargo);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editCargo(header, response, idCargo, nombre, idSector, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el cargo. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Cargos']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el cargo. No cuenta con los permisos suficientes.'});
    }

    const cargo = await privateGetCargoById(idCargo);
    if(!cargo) return response.status(404).json({ error: 'Error al editar el cargo. Cargo no encontrado.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el cargo. Usuario no encontrado.' });

    const sector = await privateGetSectorById(idSector);
    if(!sector) return response.status(404).json({ error: 'Error al editar el cargo. Sector no encontrado.' });
    
    //Crear objeto de actualizacion
    const updateCargo = new Cargo({
      //Propiedades de objeto
      nombre,
      sector,
      //Propiedades de control
      original: cargo._id,
      version: updateVersion(cargo.ultimaRevision),
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
      cargo.nombre = nombre;
      cargo.sector = sector;
      //Propiedades de control
      cargo.version = updateVersion(cargo.version, aprobar);
      cargo.ultimaRevision = cargo.version;
      cargo.fechaEdicion = new Date();
      cargo.editor = editor;
      cargo.fechaRevision = new Date();
      cargo.revisor = editor;
      cargo.observaciones = null;
    }
    else{
      cargo.pendientes = cargo.pendientes.concat(editor._id);
      cargo.ultimaRevision = updateVersion(cargo.ultimaRevision)
    }
  
    await updateCargo.save();
    await cargo.save();

    response.json(updateCargo);
    return response;

  } catch (error) {
    throw error;
  }
}



//Review
export async function revisarUpdateCargo(header, response, idCargo, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el cargo. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Cargos']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el cargo. No cuenta con los permisos suficientes.'});
    }

    const updateCargo = await privateGetCargoById(idCargo);
    if(!updateCargo) return response.status(404).json({ error: 'Error al revisar el cargo. Revisión no encontrada.' });

    const original = await privateGetCargoById(updateCargo.original);
    if(!original && updateCargo.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el cargo. Tipo de Organización no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el cargo. Usuario no encontrado.' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateCargo.estado = 'Validado'
      updateCargo.fechaRevision = new Date();
      updateCargo.revisor = revisor;
      updateCargo.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateCargo.nombre;
        original.sector = updateCargo.sector;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateCargo.fechaEdicion;
        original.editor = updateCargo.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const cargo = new Cargo({
          //Propiedades de objeto
          nombre: updateCargo.nombre,
          sector: updateCargo.sector,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateCargo.fechaEdicion,
          editor: updateCargo.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateCargo.original = cargo._id;
  
        await updateCargo.save();
  
        cargo.original = cargo._id;
        await cargo.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateCargo.estado = 'Rechazado'
      updateCargo.fechaRevision = new Date();
      updateCargo.revisor = revisor;
      updateCargo.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateCargo.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateCargo.save();

    response.json(updateCargo);
    return response;
    
  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteCargo(header, response, idCargo, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el cargo. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Cargos']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el cargo. No cuenta con los permisos suficientes.'});
  }

  const cargo = await privateGetCargoById(idCargo);
  if(!cargo) return response.status(404).json({ error: 'Error al eliminar el cargo. Cargo no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el cargo. Usuario no encontrado.' });

  if(cargo.estado !== 'Eliminado'){
    cargo.estado = 'Eliminado'
    cargo.fechaEliminacion = new Date();
    cargo.eliminador = eliminador;
    cargo.observaciones = observaciones;
  }

  else{
    cargo.estado = 'Publicado'
    cargo.fechaEliminacion = null;
    cargo.eliminador = null;
    cargo.observaciones = null;
  }
  

  await cargo.save();

  response.json(cargo);
  return response;
}