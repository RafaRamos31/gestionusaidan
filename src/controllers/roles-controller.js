import Rol from "../models/roles.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetRolById(idRol){
  try {
    return Rol.findById(idRol);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountRoles({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Roles. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Roles'] === false){
      return response.status(401).json({ error: 'Error al obtener Roles. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Roles']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Rol.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedRoles({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Roles. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Roles'] === false){
      return response.status(401).json({ error: 'Error al obtener Roles. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Roles']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const roles = await Rol.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(roles);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListRoles({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Roles. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const roles = await Rol.find(filterQuery, '_id nombre').sort(sortQuery);

    response.json(roles);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getRolById(header, response, idRol){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Rol. ' + auth.payload });
    
    //Validaciones de rol
    const rolPerm = await privateGetRolById(auth.payload.userRolId);
    if(rolPerm && (rolPerm.permisos.vistas['Configuración']['Roles'] === false && rolPerm.permisos.acciones['Roles']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Rol. No cuenta con los permisos suficientes.'});
    }

    const rol = await Rol.findById(idRol).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(rol);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones depto
export async function getRevisionesRol(header, response, idRol){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Rol. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Roles']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Rol. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Rol.find({original: {_id: idRol}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor',
      select: '_id nombre',
    }]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear depto
export async function createRol(header, response, nombre, permisos, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el rol. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Roles']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el rol. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el rol. Usuario no encontrado.' });

    const baseRol = new Rol({
      //Propiedades de objeto
      nombre,
      permisos,
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

    await baseRol.save();

    if(aprobar){
      const rol = new Rol({
        //Propiedades de objeto
        nombre,
        permisos,
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
      
      baseRol.original = rol._id;
      baseRol.estado = 'Validado';
      baseRol.fechaRevision = new Date();
      baseRol.revisor = editor;

      await baseRol.save();

      rol.original = rol._id;
      await rol.save();
    }

    response.json(baseRol);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editRol(header, response, idRol, nombre, permisos, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el rol. ' + auth.payload });

    //Validaciones de rol
    const rolPerm = await privateGetRolById(auth.payload.userRolId);
    if(rolPerm && rolPerm.permisos.acciones['Roles']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el rol. No cuenta con los permisos suficientes.'});
    }

    const rol = await privateGetRolById(idRol);
    if(!rol) return response.status(404).json({ error: 'Error al editar el rol. Rol no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el rol. Usuario no encontrado' });

    //Crear objeto de actualizacion
    const updateRol = new Rol({
      //Propiedades de objeto
      nombre,
      permisos,
      //Propiedades de control
      original: rol._id,
      version: updateVersion(rol.ultimaRevision),
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
      rol.nombre = nombre;
      rol.permisos = permisos;
      //Propiedades de control
      rol.version = updateVersion(rol.version, aprobar);
      rol.ultimaRevision = rol.version;
      rol.fechaEdicion = new Date();
      rol.editor = editor;
      rol.fechaRevision = new Date();
      rol.revisor = editor;
      rol.observaciones = null;
    }
    else{
      rol.pendientes = rol.pendientes.concat(editor._id);
      rol.ultimaRevision = updateVersion(rol.ultimaRevision)
    }
  
    await updateRol.save();
    await rol.save();

    response.json(updateRol);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateRol(header, response, idRol, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el rol. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Roles']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el rol. No cuenta con los permisos suficientes.'});
    }

    const updateRol = await privateGetRolById(idRol);
    if(!updateRol) return response.status(404).json({ error: 'Error al revisar el rol. Revisión no encontrada.' });

    const original = await privateGetRolById(updateRol.original);
    if(!original && updateRol.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el rol. Rol no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el rol. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateRol.estado = 'Validado'
      updateRol.fechaRevision = new Date();
      updateRol.revisor = revisor;
      updateRol.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateRol.nombre;
        original.permisos = updateRol.permisos;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateRol.fechaEdicion;
        original.editor = updateRol.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const rol = new Rol({
          //Propiedades de objeto
          nombre: updateRol.nombre,
          permisos: updateRol.permisos,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateRol.fechaEdicion,
          editor: updateRol.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateRol.original = rol._id;
  
        await updateRol.save();
  
        rol.original = rol._id;
        await rol.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateRol.estado = 'Rechazado'
      updateRol.fechaRevision = new Date();
      updateRol.revisor = revisor;
      updateRol.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateRol.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateRol.save();

    response.json(updateRol);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteRol(header, response, idRol, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el rol. ' + auth.payload });

  //Validaciones de rol
  const rolPerm = await privateGetRolById(auth.payload.userRolId);
  if(rolPerm && rolPerm.permisos.acciones['Roles']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el rol. No cuenta con los permisos suficientes.'});
  }

  const rol = await privateGetRolById(idRol);
  if(!rol) return response.status(404).json({ error: 'Error al eliminar el rol. Rol no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el rol. Usuario no encontrado.' });

  if(rol.estado !== 'Eliminado'){
    rol.estado = 'Eliminado'
    rol.fechaEliminacion = new Date();
    rol.eliminador = eliminador;
    rol.observaciones = observaciones;
  }

  else{
    rol.estado = 'Publicado'
    rol.fechaEliminacion = null;
    rol.eliminador = null;
    rol.observaciones = null;
  }
  

  await rol.save();

  response.json(rol);
  return response;
}