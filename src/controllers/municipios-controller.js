import Municipio from "../models/municipios.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetDepartamentoById } from "./departamentos-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Internos para validacion de claves unicas
async function validateUniquesMunicipio({id=null, geocode = null}){
  let filter = {estado: 'Publicado'}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Municipio.exists(filter);
}

//Get internal
export async function privateGetMunicipioById(idMunicipio){
  try {
    return Municipio.findById(idMunicipio).populate([
      {
      path: 'departamento',
      select: '_id nombre geocode',
      },
    ]);
  } catch (error) {
    throw error;
  }
}

//Get Count
export async function getCountMunicipios({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Municipios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Municipios'] === false){
      return response.status(401).json({ error: 'Error al obtener Municipios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Municipios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Municipio.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedMunicipios({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Municipios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Municipios'] === false){
      return response.status(401).json({ error: 'Error al obtener Municipios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Municipios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const municipios = await Municipio.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'departamento',
      select: '_id nombre geocode',
      },
    ]);

    response.json(municipios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListMunicipios({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Municipios. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { geocode: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const municipios = await Municipio.find(filterQuery, '_id nombre geocode').sort(sortQuery);

    response.json(municipios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getMunicipioById(header, response, idMunicipio){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Municipio. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Configuración']['Municipios'] === false && rol.permisos.acciones['Municipios']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Municipio. No cuenta con los permisos suficientes.'});
    }

    const municipio = await Municipio.findById(idMunicipio).populate([
    {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'departamento',
      select: '_id nombre geocode',
      },
    ]);

    response.json(municipio);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones municipio
export async function getRevisionesMunicipio(header, response, idMunicipio){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Municipio. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Municipios']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Municipio. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Municipio.find({original: {_id: idMunicipio}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([
    {
      path: 'editor revisor eliminador',
      select: '_id nombre',
      },
      {
      path: 'departamento',
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
export async function createMunicipio(header, response, nombre, geocode, idDepartamento, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el municipio. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Municipios']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el municipio. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el municipio. Usuario no encontrado.' });

    const existentGeocode = await validateUniquesMunicipio({geocode})
    if(existentGeocode) return response.status(400).json({ error: `Error al crear el municipio. El geocode ${geocode} ya está en uso.` });

    const departamento = await privateGetDepartamentoById(idDepartamento);
    if(!departamento) return response.status(404).json({ error: 'Error al crear el municipio. Departamento no encontrado.' });
    
    const baseMunicipio = new Municipio({
      //Propiedades de objeto
      nombre,
      geocode,
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

    await baseMunicipio.save();

    if(aprobar){
      const municipio = new Municipio({
        //Propiedades de objeto
        nombre,
        geocode,
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
      
      baseMunicipio.original = municipio._id;
      baseMunicipio.estado = 'Validado';
      baseMunicipio.fechaRevision = new Date();
      baseMunicipio.revisor = editor;

      await baseMunicipio.save();

      municipio.original = municipio._id;
      await municipio.save();
    }

    response.json(baseMunicipio);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editMunicipio(header, response, idMunicipio, nombre, geocode, idDepartamento, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el municipio. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Municipios']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el municipio. No cuenta con los permisos suficientes.'});
    }

    const municipio = await privateGetMunicipioById(idMunicipio);
    if(!municipio) return response.status(404).json({ error: 'Error al editar el municipio. Municipio no encontrado.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el municipio. Usuario no encontrado.' });

    const existentGeocode = await validateUniquesMunicipio({geocode, id: idMunicipio})
    if(existentGeocode) return response.status(400).json({ error: `Error al editar el municipio. El geocode ${geocode} ya está en uso.` });

    const departamento = await privateGetDepartamentoById(idDepartamento);
    if(!departamento) return response.status(404).json({ error: 'Error al editar el municipio. Departamento no encontrado.' });
    
    //Crear objeto de actualizacion
    const updateMunicipio = new Municipio({
      //Propiedades de objeto
      nombre,
      geocode,
      departamento,
      //Propiedades de control
      original: municipio._id,
      version: updateVersion(municipio.ultimaRevision),
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
      municipio.nombre = nombre;
      municipio.geocode = geocode;
      municipio.departamento = departamento;
      //Propiedades de control
      municipio.version = updateVersion(municipio.version, aprobar);
      municipio.ultimaRevision = municipio.version;
      municipio.fechaEdicion = new Date();
      municipio.editor = editor;
      municipio.fechaRevision = new Date();
      municipio.revisor = editor;
      municipio.observaciones = null;
    }
    else{
      municipio.pendientes = municipio.pendientes.concat(editor._id);
      municipio.ultimaRevision = updateVersion(municipio.ultimaRevision)
    }
  
    await updateMunicipio.save();
    await municipio.save();

    response.json(updateMunicipio);
    return response;

  } catch (error) {
    throw error;
  }
}



//Review
export async function revisarUpdateMunicipio(header, response, idMunicipio, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el municipio. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Municipios']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el municipio. No cuenta con los permisos suficientes.'});
    }

    const updateMunicipio = await privateGetMunicipioById(idMunicipio);
    if(!updateMunicipio) return response.status(404).json({ error: 'Error al revisar el municipio. Revisión no encontrada.' });

    const original = await privateGetMunicipioById(updateMunicipio.original);
    if(!original && updateMunicipio.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el municipio. Municipio no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el municipio. Usuario no encontrado.' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateMunicipio.estado = 'Validado'
      updateMunicipio.fechaRevision = new Date();
      updateMunicipio.revisor = revisor;
      updateMunicipio.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateMunicipio.nombre;
        original.geocode = updateMunicipio.geocode;
        original.departamento = updateMunicipio.departamento;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateMunicipio.fechaEdicion;
        original.editor = updateMunicipio.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const municipio = new Municipio({
          //Propiedades de objeto
          nombre: updateMunicipio.nombre,
          geocode: updateMunicipio.geocode,
          departamento: updateMunicipio.departamento,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateMunicipio.fechaEdicion,
          editor: updateMunicipio.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateMunicipio.original = municipio._id;
  
        await updateMunicipio.save();
  
        municipio.original = municipio._id;
        await municipio.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateMunicipio.estado = 'Rechazado'
      updateMunicipio.fechaRevision = new Date();
      updateMunicipio.revisor = revisor;
      updateMunicipio.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateMunicipio.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateMunicipio.save();

    response.json(updateMunicipio);
    return response;
    
  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteMunicipio(header, response, idMunicipio, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el municipio. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Municipios']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el municipio. No cuenta con los permisos suficientes.'});
  }

  const municipio = await privateGetMunicipioById(idMunicipio);
  if(!municipio) return response.status(404).json({ error: 'Error al eliminar el municipio. Municipio no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el municipio. Usuario no encontrado.' });

  if(municipio.estado !== 'Eliminado'){
    municipio.estado = 'Eliminado'
    municipio.fechaEliminacion = new Date();
    municipio.eliminador = eliminador;
    municipio.observaciones = observaciones;
  }

  else{
    municipio.estado = 'Publicado'
    municipio.fechaEliminacion = null;
    municipio.eliminador = null;
    municipio.observaciones = null;
  }
  

  await municipio.save();

  response.json(municipio);
  return response;
}