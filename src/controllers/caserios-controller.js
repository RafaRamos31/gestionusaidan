import Caserio from "../models/caserios.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetAldeaById } from "./aldeas-controller.js";
import { privateGetDepartamentoById } from "./departamentos-controller.js";
import { privateGetMunicipioById } from "./municipios-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Internos para validacion de claves unicas
async function validateUniquesCaserio({id=null, geocode = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Caserio.exists(filter);
}

//Get internal
export async function privateGetCaserioById(idCaserio){
  try {
    return Caserio.findById(idCaserio).populate([
      {
      path: 'aldea municipio departamento',
      select: '_id nombre geocode',
      },
    ]);
  } catch (error) {
    throw error;
  }
}

//Get Count
export async function getCountCaserios({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Caserios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Caserios'] === false){
      return response.status(401).json({ error: 'Error al obtener Caserios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Caserios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Caserio.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedCaserios({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Caserios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Caserios'] === false){
      return response.status(401).json({ error: 'Error al obtener Caserios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Caserios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const caserios = await Caserio.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'aldea municipio departamento',
      select: '_id nombre geocode',
      },
    ]);

    response.json(caserios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListCaserios({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Caserios. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const caserios = await Caserio.find(filterQuery, '_id nombre geocode').limit(50).sort(sortQuery);

    response.json(caserios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getCaserioById(header, response, idCaserio){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Caserio. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Configuración']['Caserios'] === false && rol.permisos.acciones['Caserios']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Caserio. No cuenta con los permisos suficientes.'});
    }

    const caserio = await Caserio.findById(idCaserio).populate([
    {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'aldea municipio departamento',
      select: '_id nombre geocode',
      },
    ]);

    response.json(caserio);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones caserio
export async function getRevisionesCaserio(header, response, idCaserio){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Caserio. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Caserios']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Caserio. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Caserio.find({original: {_id: idCaserio}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([
    {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'aldea municipio departamento',
      select: '_id nombre geocode',
      },
    ]);
    
    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear caserio
export async function createCaserio(header, response, nombre, geocode, idAldea, idMunicipio, idDepartamento, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el caserio. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Caserios']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el caserio. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el caserio. Usuario no encontrado.' });

    const existentGeocode = await validateUniquesCaserio({geocode})
    if(existentGeocode) return response.status(400).json({ error: `Error al crear el caserio. El geocode ${geocode} ya está en uso.` });

    const aldea = await privateGetAldeaById(idAldea);
    if(!aldea) return response.status(404).json({ error: 'Error al crear el caserio. Aldea no encontrada.' });

    const municipio = await privateGetMunicipioById(idMunicipio);
    if(!municipio) return response.status(404).json({ error: 'Error al crear el caserio. Municipio no encontrada.' });

    const departamento = await privateGetDepartamentoById(idDepartamento);
    if(!departamento) return response.status(404).json({ error: 'Error al crear el caserio. Departamento no encontrada.' });
    
    const baseCaserio = new Caserio({
      //Propiedades de objeto
      nombre,
      geocode,
      aldea,
      municipio,
      departamento,
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

    await baseCaserio.save();

    if(aprobar){
      const caserio = new Caserio({
        //Propiedades de objeto
        nombre,
        geocode,
        aldea,
        municipio,
        departamento,
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
      
      baseCaserio.original = caserio._id;
      baseCaserio.estado = 'Validado';
      baseCaserio.fechaRevision = new Date();
      baseCaserio.revisor = editor;

      await baseCaserio.save();

      caserio.original = caserio._id;
      await caserio.save();
    }

    response.json(baseCaserio);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editCaserio(header, response, idCaserio, nombre, geocode, idAldea, idMunicipio, idDepartamento, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el caserio. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Caserios']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el caserio. No cuenta con los permisos suficientes.'});
    }

    const caserio = await privateGetCaserioById(idCaserio);
    if(!caserio) return response.status(404).json({ error: 'Error al editar el caserio. Caserio no encontrado.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el caserio. Usuario no encontrado.' });

    const existentGeocode = await validateUniquesCaserio({geocode, id: idCaserio})
    if(existentGeocode) return response.status(400).json({ error: `Error al editar el caserio. El geocode ${geocode} ya está en uso.` });

    const aldea = await privateGetAldeaById(idAldea);
    if(!aldea) return response.status(404).json({ error: 'Error al editar el caserio. Aldea no encontrada.' });

    const municipio = await privateGetMunicipioById(idMunicipio);
    if(!municipio) return response.status(404).json({ error: 'Error al editar el caserio. Municipio no encontrada.' });

    const departamento = await privateGetDepartamentoById(idDepartamento);
    if(!departamento) return response.status(404).json({ error: 'Error al editar el caserio. Departamento no encontrada.' });
    
    //Crear objeto de actualizacion
    const updateCaserio = new Caserio({
      //Propiedades de objeto
      nombre,
      geocode,
      aldea,
      municipio,
      departamento,
      //Propiedades de control
      original: caserio._id,
      version: updateVersion(caserio.ultimaRevision),
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
      caserio.nombre = nombre;
      caserio.geocode = geocode;
      caserio.aldea = aldea;
      caserio.municipio = municipio;
      caserio.departamento = departamento;
      //Propiedades de control
      caserio.version = updateVersion(caserio.version, aprobar);
      caserio.ultimaRevision = caserio.version;
      caserio.fechaEdicion = new Date();
      caserio.editor = editor;
      caserio.fechaRevision = new Date();
      caserio.revisor = editor;
      caserio.observaciones = null;
    }
    else{
      caserio.pendientes = caserio.pendientes.concat(editor._id);
      caserio.ultimaRevision = updateVersion(caserio.ultimaRevision)
    }
  
    await updateCaserio.save();
    await caserio.save();

    response.json(updateCaserio);
    return response;

  } catch (error) {
    throw error;
  }
}



//Review
export async function revisarUpdateCaserio(header, response, idCaserio, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el caserio. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Caserios']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el caserio. No cuenta con los permisos suficientes.'});
    }

    const updateCaserio = await privateGetCaserioById(idCaserio);
    if(!updateCaserio) return response.status(404).json({ error: 'Error al revisar el caserio. Revisión no encontrada.' });

    const original = await privateGetCaserioById(updateCaserio.original);
    if(!original && updateCaserio.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el caserio. Caserio no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el caserio. Usuario no encontrado.' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateCaserio.estado = 'Validado'
      updateCaserio.fechaRevision = new Date();
      updateCaserio.revisor = revisor;
      updateCaserio.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateCaserio.nombre;
        original.geocode = updateCaserio.geocode;
        original.aldea = updateCaserio.aldea;
        original.municipio = updateCaserio.municipio;
        original.departamento = updateCaserio.departamento;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateCaserio.fechaEdicion;
        original.editor = updateCaserio.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const caserio = new Caserio({
          //Propiedades de objeto
          nombre: updateCaserio.nombre,
          geocode: updateCaserio.geocode,
          aldea: updateCaserio.aldea,
          municipio: updateCaserio.municipio,
          departamento: updateCaserio.departamento,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateCaserio.fechaEdicion,
          editor: updateCaserio.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateCaserio.original = caserio._id;
  
        await updateCaserio.save();
  
        caserio.original = caserio._id;
        await caserio.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateCaserio.estado = 'Rechazado'
      updateCaserio.fechaRevision = new Date();
      updateCaserio.revisor = revisor;
      updateCaserio.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateCaserio.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateCaserio.save();

    response.json(updateCaserio);
    return response;
    
  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteCaserio(header, response, idCaserio, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el caserio. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Caserios']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el caserio. No cuenta con los permisos suficientes.'});
  }

  const caserio = await privateGetCaserioById(idCaserio);
  if(!caserio) return response.status(404).json({ error: 'Error al eliminar el caserio. Caserio no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el caserio. Usuario no encontrado.' });

  if(caserio.estado !== 'Eliminado'){
    caserio.estado = 'Eliminado'
    caserio.fechaEliminacion = new Date();
    caserio.eliminador = eliminador;
    caserio.observaciones = observaciones;
  }

  else{
    caserio.estado = 'Publicado'
    caserio.fechaEliminacion = null;
    caserio.eliminador = null;
    caserio.observaciones = null;
  }
  

  await caserio.save();

  response.json(caserio);
  return response;
}