import { content_v2_1 } from "googleapis";
import Year from "../models/years.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";
import moment from "moment-timezone";

//Internos para validacion de claves unicas
async function validateUniquesYear({id=null, nombre = null}){
  let filter = {estado: 'Publicado'}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Year.exists(filter);
}

//Get internal
export async function privateGetYearById(idYear){
  try {
    return Year.findById(idYear);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountYears({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Años Fiscales. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Años Fiscales'] === false){
      return response.status(401).json({ error: 'Error al obtener Años Fiscales. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Años Fiscales']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Year.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedYears({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Años Fiscales. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Años Fiscales'] === false){
      return response.status(401).json({ error: 'Error al obtener Años Fiscales. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Años Fiscales']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const years = await Year.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(years);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListYears({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Años Fiscales. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const years = await Year.find(filterQuery, '_id nombre fechaInicio fechaFinal').sort(sortQuery);

    response.json(years);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual
export async function getYearById(header, response, idYear){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Años Fiscales. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Años Fiscales'] === false && rol.permisos.acciones['Años Fiscales']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Años Fiscales. No cuenta con los permisos suficientes.'});
    }

    const year = await Year.findById(idYear).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(year);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones depto
export async function getRevisionesYear(header, response, idYear){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Año Fiscal. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Años Fiscales']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Años Fiscales. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Year.find({original: {_id: idYear}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
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
export async function createYear(header, response, nombre, baseFechaInicio, baseFechaFinal, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el año fiscal. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Años Fiscales']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Años Fiscales. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el año fiscal. Usuario no encontrado.' });

    const existentName = await validateUniquesYear({nombre})
    if(existentName) return response.status(400).json({ error: `Error al crear el año fiscal. El año ${nombre} ya está en uso.` });

    const fechaInicio = moment(baseFechaInicio).startOf('day');
    const fechaFinal = moment(baseFechaFinal).endOf('day');

    const baseYear = new Year({
      //Propiedades de objeto
      nombre,
      fechaInicio,
      fechaFinal,
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

    await baseYear.save();

    if(aprobar){
      const year = new Year({
        //Propiedades de objeto
        nombre,
        fechaInicio,
        fechaFinal,
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

      baseYear.original = year._id;
      baseYear.estado = 'Validado';
      baseYear.fechaRevision = new Date();
      baseYear.revisor = editor;

      await baseYear.save();

      year.original = year._id;
      await year.save();
    }

    response.json(baseYear);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editYear(header, response, idYear, nombre, baseFechaInicio, baseFechaFinal, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el año fiscal. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Años Fiscales']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar Años Fiscales. No cuenta con los permisos suficientes.'});
    }

    const year = await privateGetYearById(idYear);
    if(!year) return response.status(404).json({ error: 'Error al editar el año fiscal. Año fiscal no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el año fiscal. Usuario no encontrado' });

    const existentName = await validateUniquesYear({nombre, id: idYear})
    if(existentName) return response.status(400).json({ error: `Error al editar el año fiscal. El año ${nombre} ya está en uso.` });

    const fechaInicio = moment(baseFechaInicio).startOf('day');
    const fechaFinal = moment(baseFechaFinal).endOf('day');
    
    //Crear objeto de actualizacion
    const updateYear = new Year({
      //Propiedades de objeto
      nombre,
      fechaInicio,
      fechaFinal,
      //Propiedades de control
      original: year._id,
      version: updateVersion(year.ultimaRevision),
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
      year.nombre = nombre;
      year.geocode = geocode;
      //Propiedades de control
      year.version = updateVersion(year.version, aprobar);
      year.ultimaRevision = year.version;
      year.fechaEdicion = new Date();
      year.editor = editor;
      year.fechaRevision = new Date();
      year.revisor = editor;
      year.observaciones = null;
    }
    else{
      year.pendientes = year.pendientes.concat(editor._id);
      year.ultimaRevision = updateVersion(year.ultimaRevision)
    }

    await updateYear.save();
    await year.save();

    response.json(updateYear);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateYear(header, response, idYear, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el año fiscal. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Años Fiscales']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Años Fiscales. No cuenta con los permisos suficientes.'});
    }

    const updateYear = await privateGetYearById(idYear);
    if(!updateYear) return response.status(404).json({ error: 'Error al revisar el año fiscal. Revisión no encontrada.' });

    const original = await privateGetYearById(updateYear.original);
    if(!original && updateYear.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el año fiscal. Año fiscal no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el año fiscal. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control
      updateYear.estado = 'Validado'
      updateYear.fechaRevision = new Date();
      updateYear.revisor = revisor;
      updateYear.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateYear.nombre;
        original.fechaInicio = updateYear.fechaInicio;
        original.fechaFinal = updateYear.fechaFinal;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateYear.fechaEdicion;
        original.editor = updateYear.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const year = new Year({
          //Propiedades de objeto
          nombre: updateYear.nombre,
          fechaInicio: updateYear.fechaInicio,
          fechaFinal: updateYear.fechaFinal,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateYear.fechaEdicion,
          editor: updateYear.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })

        updateYear.original = year._id;

        await updateYear.save();

        year.original = year._id;
        await year.save();
      }

    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control
      updateYear.estado = 'Rechazado'
      updateYear.fechaRevision = new Date();
      updateYear.revisor = revisor;
      updateYear.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateYear.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }

    await updateYear.save();

    response.json(updateYear);
    return response;

  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteYear(header, response, idYear, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el año fiscal. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Años Fiscales']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar Años Fiscales. No cuenta con los permisos suficientes.'});
  }

  const year = await privateGetYearById(idYear);
  if(!year) return response.status(404).json({ error: 'Error al eliminar el año fiscal. Año fiscal no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el año fiscal. Usuario no encontrado.' });

  if(year.estado !== 'Eliminado'){
    year.estado = 'Eliminado'
    year.fechaEliminacion = new Date();
    year.eliminador = eliminador;
    year.observaciones = observaciones;
  }

  else{
    year.estado = 'Publicado'
    year.fechaEliminacion = null;
    year.eliminador = null;
    year.observaciones = null;
  }


  await year.save();

  response.json(year);
  return response;
}