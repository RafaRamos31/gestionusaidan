import Componente from "../models/componentes.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetComponenteById(idComponente){
  try {
    return Componente.findById(idComponente);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountComponentes({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Componentes. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Componentes'] === false){
      return response.status(401).json({ error: 'Error al obtener Componentes. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Componentes']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Componente.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedComponentes({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Componentes. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Componentes'] === false){
      return response.status(401).json({ error: 'Error al obtener Componentes. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Componentes']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const componentes = await Componente.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(componentes);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListComponentes({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Componentes. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const componentes = await Componente.find(filterQuery, '_id nombre descripcion').sort(sortQuery);

    response.json(componentes);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getComponentesById(header, response, idComponente){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener el componente. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Configuración']['Componentes'] === false && rol.permisos.acciones['Componentes']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Componente. No cuenta con los permisos suficientes.'});
    }

    const componente = await Componente.findById(idComponente).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(componente);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones componente
export async function getRevisionesComponente(header, response, idComponente){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Componente. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Componentes']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Componente. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Componente.find({original: {_id: idComponente}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor',
      select: '_id nombre',
    }]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear componente
export async function createComponente(header, response, nombre, descripcion, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el componente. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Componentes']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el componente. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el componente. Usuario no encontrado.' });

    const baseComponente = new Componente({
      //Propiedades de objeto
      nombre,
      descripcion,
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

    await baseComponente.save();

    if(aprobar){
      const componente = new Componente({
        //Propiedades de objeto
        nombre,
        descripcion,
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
      
      baseComponente.original = componente._id;
      baseComponente.estado = 'Validado';
      baseComponente.fechaRevision = new Date();
      baseComponente.revisor = editor;

      await baseComponente.save();

      componente.original = componente._id;
      await componente.save();
    }

    response.json(baseComponente);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editComponente(header, response, idComponente, nombre, descripcion, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el componente. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Componentes']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el componente. No cuenta con los permisos suficientes.'});
    }

    const componente = await privateGetComponenteById(idComponente);
    if(!componente) return response.status(404).json({ error: 'Error al editar el componente. Componente no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el componente. Usuario no encontrado' });

    //Crear objeto de actualizacion
    const updateComponente = new Componente({
      //Propiedades de objeto
      nombre,
      descripcion,
      //Propiedades de control
      original: componente._id,
      version: updateVersion(componente.ultimaRevision),
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
      componente.nombre = nombre;
      componente.descripcion = descripcion;
      //Propiedades de control
      componente.version = updateVersion(componente.version, aprobar);
      componente.ultimaRevision = componente.version;
      componente.fechaEdicion = new Date();
      componente.editor = editor;
      componente.fechaRevision = new Date();
      componente.revisor = editor;
      componente.observaciones = null;
    }
    else{
      componente.pendientes = componente.pendientes.concat(editor._id);
      componente.ultimaRevision = updateVersion(componente.ultimaRevision)
    }
  
    await updateComponente.save();
    await componente.save();

    response.json(updateComponente);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateComponente(header, response, idComponente, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el componente. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Componentes']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el componente. No cuenta con los permisos suficientes.'});
    }

    const updateComponente = await privateGetComponenteById(idComponente);
    if(!updateComponente) return response.status(404).json({ error: 'Error al revisar el componente. Revisión no encontrada.' });

    const original = await privateGetComponenteById(updateComponente.original);
    if(!original && updateComponente.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el componente. Componente no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el componente. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateComponente.estado = 'Validado'
      updateComponente.fechaRevision = new Date();
      updateComponente.revisor = revisor;
      updateComponente.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateComponente.nombre;
        original.descripcion = updateComponente.descripcion;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateComponente.fechaEdicion;
        original.editor = updateComponente.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const componente = new Componente({
          //Propiedades de objeto
          nombre: updateComponente.nombre,
          descripcion: updateComponente.descripcion,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateComponente.fechaEdicion,
          editor: updateComponente.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateComponente.original = componente._id;

        await updateComponente.save();

        componente.original = componente._id;
        await componente.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateComponente.estado = 'Rechazado'
      updateComponente.fechaRevision = new Date();
      updateComponente.revisor = revisor;
      updateComponente.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateComponente.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateComponente.save();

    response.json(updateComponente);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteComponente(header, response, idComponente, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el componente. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Componentes']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el componente. No cuenta con los permisos suficientes.'});
  }

  const componente = await privateGetComponenteById(idComponente);
  if(!componente) return response.status(404).json({ error: 'Error al eliminar el componente. Componente no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el componente. Usuario no encontrado.' });

  if(componente.estado !== 'Eliminado'){
    componente.estado = 'Eliminado'
    componente.fechaEliminacion = new Date();
    componente.eliminador = eliminador;
    componente.observaciones = observaciones;
  }

  else{
    componente.estado = 'Publicado'
    componente.fechaEliminacion = null;
    componente.eliminador = null;
    componente.observaciones = null;
  }
  

  await componente.save();

  response.json(componente);
  return response;
}