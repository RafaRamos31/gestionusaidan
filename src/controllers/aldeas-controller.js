import Aldea from "../models/aldeas.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetMunicipioById } from "./municipios-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Internos para validacion de claves unicas
async function validateUniquesAldea({id=null, geocode = null}){
  let filter = {estado: 'Publicado'}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Aldea.exists(filter);
}

//Get internal
export async function privateGetAldeaById(idAldea){
  try {
    return Aldea.findById(idAldea).populate([
      {
      path: 'municipio',
      select: '_id nombre geocode',
      },
    ]);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountAldeas({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Aldeas. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Aldeas'] === false){
      return response.status(401).json({ error: 'Error al obtener Aldeas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Aldeas']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Aldea.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedAldeas({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Aldeas. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Aldeas'] === false){
      return response.status(401).json({ error: 'Error al obtener Aldeas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Aldeas']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const aldeas = await Aldea.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'municipio',
      select: '_id nombre geocode',
      },
    ]);

    response.json(aldeas);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListAldeas({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Aldeas. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({sort, defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const aldeas = await Aldea.find(filterQuery, '_id nombre geocode').sort(sortQuery);

    response.json(aldeas);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getAldeaById(header, response, idAldea){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Aldea. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Configuración']['Aldeas'] === false && rol.permisos.acciones['Aldeas']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Aldea. No cuenta con los permisos suficientes.'});
    }

    const aldea = await Aldea.findById(idAldea).populate([
    {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'municipio',
      select: '_id nombre geocode',
      },
    ]);

    response.json(aldea);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones municipio
export async function getRevisionesAldea(header, response, idAldea){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Aldea. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Aldeas']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Aldea. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Aldea.find({original: {_id: idAldea}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([
    {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'municipio',
      select: '_id nombre geocode',
      },
    ]);
    
    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear depto
export async function createAldea(header, response, nombre, geocode, idMunicipio, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear la aldea. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Aldeas']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear la aldea. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear la aldea. Usuario no encontrado.' });

    const existentGeocode = await validateUniquesAldea({geocode})
    if(existentGeocode) return response.status(400).json({ error: `Error al crear la aldea. El geocode ${geocode} ya está en uso.` });

    const municipio = await privateGetMunicipioById(idMunicipio);
    if(!municipio) return response.status(404).json({ error: 'Error al crear la aldea. Municipio no encontrado.' });
    
    const baseAldea = new Aldea({
      //Propiedades de objeto
      nombre,
      geocode,
      municipio,
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

    await baseAldea.save();

    if(aprobar){
      const aldea = new Aldea({
        //Propiedades de objeto
        nombre,
        geocode,
        municipio,
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
      
      baseAldea.original = aldea._id;
      baseAldea.estado = 'Validado';
      baseAldea.fechaRevision = new Date();
      baseAldea.revisor = editor;

      await baseAldea.save();

      aldea.original = aldea._id;
      await aldea.save();
    }

    response.json(baseAldea);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editAldea(header, response, idAldea, nombre, geocode, idMunicipio, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar la aldea. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Aldeas']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar la aldea. No cuenta con los permisos suficientes.'});
    }

    const aldea = await privateGetAldeaById(idAldea);
    if(!aldea) return response.status(404).json({ error: 'Error al editar la aldea. Aldea no encontrada.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar la aldea. Usuario no encontrado.' });

    const existentGeocode = await validateUniquesAldea({geocode, id: idAldea})
    if(existentGeocode) return response.status(400).json({ error: `Error al editar la aldea. El geocode ${geocode} ya está en uso.` });

    const municipio = await privateGetMunicipioById(idMunicipio);
    if(!municipio) return response.status(404).json({ error: 'Error al editar la aldea. Municipio no encontrado.' });
    
    //Crear objeto de actualizacion
    const updateAldea = new Aldea({
      //Propiedades de objeto
      nombre,
      geocode,
      municipio,
      //Propiedades de control
      original: aldea._id,
      version: updateVersion(aldea.ultimaRevision),
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
      aldea.nombre = nombre;
      aldea.geocode = geocode;
      aldea.municipio = municipio;
      //Propiedades de control
      aldea.version = updateVersion(aldea.version, aprobar);
      aldea.ultimaRevision = municipio.version;
      aldea.fechaEdicion = new Date();
      aldea.editor = editor;
      aldea.fechaRevision = new Date();
      aldea.revisor = editor;
      aldea.observaciones = null;
    }
    else{
      aldea.pendientes = aldea.pendientes.concat(editor._id);
      aldea.ultimaRevision = updateVersion(aldea.ultimaRevision)
    }
  
    await updateAldea.save();
    await aldea.save();

    response.json(updateAldea);
    return response;

  } catch (error) {
    throw error;
  }
}



//Review
export async function revisarUpdateAldea(header, response, idAldea, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar la aldea. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Aldeas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar la aldea. No cuenta con los permisos suficientes.'});
    }

    const updateAldea = await privateGetAldeaById(idAldea);
    if(!updateAldea) return response.status(404).json({ error: 'Error al revisar la aldea. Revisión no encontrada.' });

    const original = await privateGetAldeaById(updateAldea.original);
    if(!original && updateAldea.version !== '0.1') return response.status(404).json({ error: 'Error al revisar la aldea. Aldea no encontrada.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar la aldea. Usuario no encontrado.' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateAldea.estado = 'Validado'
      updateAldea.fechaRevision = new Date();
      updateAldea.revisor = revisor;
      updateAldea.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateAldea.nombre;
        original.geocode = updateAldea.geocode;
        original.municipio = updateAldea.municipio;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateAldea.fechaEdicion;
        original.editor = updateAldea.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const aldea = new Aldea({
          //Propiedades de objeto
          nombre: updateAldea.nombre,
          geocode: updateAldea.geocode,
          municipio: updateAldea.municipio,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateAldea.fechaEdicion,
          editor: updateAldea.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateAldea.original = aldea._id;
  
        await updateAldea.save();
  
        aldea.original = aldea._id;
        await aldea.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateAldea.estado = 'Rechazado'
      updateAldea.fechaRevision = new Date();
      updateAldea.revisor = revisor;
      updateAldea.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateAldea.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateAldea.save();

    response.json(updateAldea);
    return response;
    
  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteAldea(header, response, idAldea, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar la aldea. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Aldeas']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar la aldea. No cuenta con los permisos suficientes.'});
  }

  const aldea = await privateGetAldeaById(idAldea);
  if(!aldea) return response.status(404).json({ error: 'Error al eliminar la aldea. Aldea no encontrada.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar la aldea. Usuario no encontrado.' });

  if(aldea.estado !== 'Eliminado'){
    aldea.estado = 'Eliminado'
    aldea.fechaEliminacion = new Date();
    aldea.eliminador = eliminador;
    aldea.observaciones = observaciones;
  }

  else{
    aldea.estado = 'Publicado'
    aldea.fechaEliminacion = null;
    aldea.eliminador = null;
    aldea.observaciones = null;
  }
  

  await aldea.save();

  response.json(aldea);
  return response;
}