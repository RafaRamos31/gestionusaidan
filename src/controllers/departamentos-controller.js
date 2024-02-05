import Departamento from "../models/departamentos.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { getUsuarioByIdSimple } from "./usuarios-controller.js";

//Internos para validacion de claves unicas
async function validateUniquesDepartamento({id=null, geocode = null}){
  let filter = {estado: 'Publicado'}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Departamento.exists(filter);
}

//Get internal
export async function privateGetDepartamentoById(idDepartamento){
  try {
    return Departamento.findById(idDepartamento);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountDepartamentos({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Departamentos. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Departamentos'] === false){
      return response.status(401).json({ error: 'Error al obtener Departamentos. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Departamentos']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Departamento.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedDepartamentos({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Departamentos. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Departamentos'] === false){
      return response.status(401).json({ error: 'Error al obtener Departamentos. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Departamentos']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const departamentos = await Departamento.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(departamentos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListDepartamentos({header, response, sort, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Departamentos. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({sort, defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const departamentos = await Departamento.find(filterQuery, '_id nombre geocode').sort(sortQuery);

    response.json(departamentos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getDepartamentoById(header, response, idDepartamento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Departamento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Configuración']['Departamentos'] === false && rol.permisos.acciones['Departamentos']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Departamento. No cuenta con los permisos suficientes.'});
    }

    const departamento = await Departamento.findById(idDepartamento).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(departamento);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones depto
export async function getRevisionesDepartamento(header, response, idDepartamento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Departamento. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Departamentos']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Departamento. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Departamento.find({original: {_id: idDepartamento}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
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
export async function createDepartamento(header, response, nombre, geocode, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el departamento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Departamentos']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el departamento. No cuenta con los permisos suficientes.'});
    }

    const editor = await getUsuarioByIdSimple(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el departamento. Usuario no encontrado.' });

    const existentGeocode = await validateUniquesDepartamento({geocode})
    if(existentGeocode) return response.status(400).json({ error: `Error al crear el departamento. El geocode ${geocode} ya está en uso.` });

    const baseDepartamento = new Departamento({
      //Propiedades de objeto
      nombre,
      geocode,
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

    await baseDepartamento.save();

    if(aprobar){
      const departamento = new Departamento({
        //Propiedades de objeto
        nombre,
        geocode,
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
      
      baseDepartamento.original = departamento._id;
      baseDepartamento.estado = 'Validado';
      baseDepartamento.fechaRevision = new Date();
      baseDepartamento.revisor = editor;

      await baseDepartamento.save();

      departamento.original = departamento._id;
      await departamento.save();
    }

    response.json(baseDepartamento);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editDepartamento(header, response, idDepartamento, nombre, geocode, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el departamento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Departamentos']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el departamento. No cuenta con los permisos suficientes.'});
    }

    const departamento = await privateGetDepartamentoById(idDepartamento);
    if(!departamento) return response.status(404).json({ error: 'Error al editar el departamento. Departamento no encontrado' });

    const editor = await getUsuarioByIdSimple(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el departamento. Usuario no encontrado' });

    const existentGeocode = await validateUniquesDepartamento({geocode, id: idDepartamento})
    if(existentGeocode) return response.status(400).json({ error: `Error al editar el departamento. El geocode ${geocode} ya está en uso.` });

    //Crear objeto de actualizacion
    const updateDepartamento = new Departamento({
      //Propiedades de objeto
      nombre,
      geocode,
      //Propiedades de control
      original: departamento._id,
      version: updateVersion(departamento.ultimaRevision),
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
      departamento.nombre = nombre;
      departamento.geocode = geocode;
      //Propiedades de control
      departamento.version = updateVersion(departamento.version, aprobar);
      departamento.ultimaRevision = departamento.version;
      departamento.fechaEdicion = new Date();
      departamento.editor = editor;
      departamento.fechaRevision = new Date();
      departamento.revisor = editor;
      departamento.observaciones = null;
    }
    else{
      departamento.pendientes = departamento.pendientes.concat(editor._id);
      departamento.ultimaRevision = updateVersion(departamento.ultimaRevision)
    }
  
    await updateDepartamento.save();
    await departamento.save();

    response.json(updateDepartamento);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateDepartamento(header, response, idDepartamento, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el departamento. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Departamentos']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el departamento. No cuenta con los permisos suficientes.'});
    }

    const updateDepartamento = await privateGetDepartamentoById(idDepartamento);
    if(!updateDepartamento) return response.status(404).json({ error: 'Error al revisar el departamento. Revisión no encontrada.' });

    const original = await privateGetDepartamentoById(updateDepartamento.original);
    if(!original && updateDepartamento.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el departamento. Departamento no encontrado.' });

    const revisor = await getUsuarioByIdSimple(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el departamento. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateDepartamento.estado = 'Validado'
      updateDepartamento.fechaRevision = new Date();
      updateDepartamento.revisor = revisor;
      updateDepartamento.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateDepartamento.nombre;
        original.geocode = updateDepartamento.geocode;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateDepartamento.fechaEdicion;
        original.editor = updateDepartamento.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const departamento = new Departamento({
          //Propiedades de objeto
          nombre: updateDepartamento.nombre,
          geocode: updateDepartamento.geocode,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateDepartamento.fechaEdicion,
          editor: updateDepartamento.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateDepartamento.original = departamento._id;
  
        await updateDepartamento.save();
  
        departamento.original = departamento._id;
        await departamento.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateDepartamento.estado = 'Rechazado'
      updateDepartamento.fechaRevision = new Date();
      updateDepartamento.revisor = revisor;
      updateDepartamento.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateDepartamento.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateDepartamento.save();

    response.json(updateDepartamento);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteDepartamento(header, response, idDepartamento, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el departamento. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Departamentos']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el departamento. No cuenta con los permisos suficientes.'});
  }

  const departamento = await privateGetDepartamentoById(idDepartamento);
  if(!departamento) return response.status(404).json({ error: 'Error al eliminar el departamento. Departamento no encontrado.' });

  const eliminador = await getUsuarioByIdSimple(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el departamento. Usuario no encontrado.' });

  if(departamento.estado !== 'Eliminado'){
    departamento.estado = 'Eliminado'
    departamento.fechaEliminacion = new Date();
    departamento.eliminador = eliminador;
    departamento.observaciones = observaciones;
  }

  else{
    departamento.estado = 'Publicado'
    departamento.fechaEliminacion = null;
    departamento.eliminador = null;
    departamento.observaciones = null;
  }
  

  await departamento.save();

  response.json(departamento);
  return response;
}