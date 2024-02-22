import Quarter from "../models/quarters.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";
import { privateGetYearById } from "./years-controller.js";
import moment from "moment-timezone";

//Internos para validacion de claves unicas
async function validateUniquesQuarters({id=null, nombre = null, year = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }, year: { _id: year._id }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Quarter.exists(filter);
}

//Get internal
export async function privateGetQuarterById(idQuarter){
  try {
    return Quarter.findById(idQuarter);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountQuarter({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Trimestres. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Trimestres'] === false){
      return response.status(401).json({ error: 'Error al obtener Trimestres. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Trimestres']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Quarter.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedQuarters({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Trimestres. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Trimestres'] === false){
      return response.status(401).json({ error: 'Error al obtener Trimestres. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Trimestres']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { year: 1, nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const quarters = await Quarter.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador year',
      select: '_id nombre',
    }]);

    response.json(quarters);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListQuarters({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Trimestres. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const quarters = await Quarter.find(filterQuery, '_id nombre fechaInicio fechaFinal').sort(sortQuery);

    response.json(quarters);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual
export async function getQuarterById(header, response, idQuarter){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Trimestre. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Trimestres'] === false && rol.permisos.acciones['Trimestres']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Trimestres. No cuenta con los permisos suficientes.'});
    }

    const quarter = await Quarter.findById(idQuarter).populate([{
      path: 'editor revisor eliminador year',
      select: '_id nombre',
    }]);

    response.json(quarter);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones depto
export async function getRevisionesQuarter(header, response, idQuarter){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Trimestre. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Trimestres']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Trimestres. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Year.find({original: {_id: idQuarter}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor',
      select: '_id nombre',
    }]);

    response.json(revisiones);
    return response;

  } catch (error) {
    throw error;
  }
}

//Crear Quarter
export async function createQuarter(header, response, nombre, idYear, fechaInicio, baseFechaFinal, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el trimestre. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Trimestres']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el Trimestre. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el trimestre. Usuario no encontrado.' });

    const year = await privateGetYearById(idYear);
    if(!year) return response.status(404).json({ error: 'Error al crear el trimestre. Año fiscal no encontrado.' });

    const fechaFinal = moment(baseFechaFinal, 'MM/DD/YYYY');
    fechaFinal.add(1, 'day');
    fechaFinal.subtract(1, 'millisecond');

    const fechaInicioYear = new moment.utc(year.fechaInicio);
    const fechaInicioQuarter = moment(fechaInicio, 'MM/DD/YYYY');

    if (fechaInicioQuarter < fechaInicioYear) {
      return response.status(400).json({ error: `Error al crear el trimestre. El trimestre no puede empezar antes de: ${year.fechaInicio}.` });
    } 

    const fechaFinalYear = new moment.utc(year.fechaFinal);
    const fechaFinalQuarter = moment(fechaFinal, 'MM/DD/YYYY');

    if (fechaFinalQuarter > fechaFinalYear) {
      return response.status(400).json({ error: `Error al crear el trimestre. El trimestre no puede terminar despues de: ${year.fechaFinal}.` });
    } 

    const existentName = await validateUniquesQuarters({nombre, year})
    if(existentName) return response.status(400).json({ error: `Error al crear el trimestre. El trimestre ${nombre} para el año ${year.nombre} ya está en uso.` });

    const baseQuarter = new Quarter({
      //Propiedades de objeto
      nombre,
      year,
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

    await baseQuarter.save();

    if(aprobar){
      const quarter = new Quarter({
        //Propiedades de objeto
        nombre,
        year,
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

      baseQuarter.original = quarter._id;
      baseQuarter.estado = 'Validado';
      baseQuarter.fechaRevision = new Date();
      baseQuarter.revisor = editor;

      await baseQuarter.save();

      quarter.original = quarter._id;
      await quarter.save();
    }

    response.json(baseQuarter);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editQuarter(header, response, idQuarter, nombre, idYear, fechaInicio, baseFechaFinal, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el año fiscal. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Trimestres']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el Trimestre. No cuenta con los permisos suficientes.'});
    }

    const quarter = await privateGetQuarterById(idQuarter);
    if(!quarter) return response.status(404).json({ error: 'Error al editar el trimestre. Trimestre no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el trimestre. Usuario no encontrado' });

    const year = await privateGetYearById(idYear);
    if(!year) return response.status(404).json({ error: 'Error al editar el año fiscal. Año fiscal no encontrado' });

    const existentName = await validateUniquesQuarters({nombre, id: idQuarter, year})
    if(existentName) return response.status(400).json({ error: `Error al crear el trimestre. El trimestre ${nombre} para el año ${year.nombre} ya está en uso.` });

    const fechaFinal = moment(baseFechaFinal, 'MM/DD/YYYY');
    fechaFinal.add(1, 'day');
    fechaFinal.subtract(1, 'millisecond');

    //Crear objeto de actualizacion
    const updateQuarter = new Quarter({
      //Propiedades de objeto
      nombre,
      year,
      fechaInicio,
      fechaFinal,
      //Propiedades de control
      original: quarter._id,
      version: updateVersion(quarter.ultimaRevision),
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
      quarter.nombre = nombre;
      quarter.year = year;
      quarter.fechaInicio = fechaInicio;
      quarter.fechaFinal = fechaFinal;
      //Propiedades de control
      quarter.version = updateVersion(quarter.version, aprobar);
      quarter.ultimaRevision = quarter.version;
      quarter.fechaEdicion = new Date();
      quarter.editor = editor;
      quarter.fechaRevision = new Date();
      quarter.revisor = editor;
      quarter.observaciones = null;
    }
    else{
      quarter.pendientes = quarter.pendientes.concat(editor._id);
      quarter.ultimaRevision = updateVersion(quarter.ultimaRevision)
    }

    await updateQuarter.save();
    await quarter.save();

    response.json(updateQuarter);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateQuarter(header, response, idQuarter, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el trimestre. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Trimestres']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el Trimestre. No cuenta con los permisos suficientes.'});
    }

    const updateQuarter = await privateGetQuarterById(idQuarter);
    if(!updateQuarter) return response.status(404).json({ error: 'Error al revisar el trimestre. Revisión no encontrada.' });

    const original = await privateGetQuarterById(updateQuarter.original);
    if(!original && updateQuarter.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el trimestre. Trimestre no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el trimeste. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control
      updateQuarter.estado = 'Validado'
      updateQuarter.fechaRevision = new Date();
      updateQuarter.revisor = revisor;
      updateQuarter.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateQuarter.nombre;
        original.year = updateQuarter.year;
        original.fechaInicio = updateQuarter.fechaInicio;
        original.fechaFinal = updateQuarter.fechaFinal;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateQuarter.fechaEdicion;
        original.editor = updateQuarter.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const quarter = new Quarter({
          //Propiedades de objeto
          nombre: updateQuarter.nombre,
          year: updateQuarter.year,
          fechaInicio: updateQuarter.fechaInicio,
          fechaFinal: updateQuarter.fechaFinal,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateQuarter.fechaEdicion,
          editor: updateQuarter.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })

        updateQuarter.original = quarter._id;

        await updateQuarter.save();

        quarter.original = quarter._id;
        await quarter.save();
      }

    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control
      updateQuarter.estado = 'Rechazado'
      updateQuarter.fechaRevision = new Date();
      updateQuarter.revisor = revisor;
      updateQuarter.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateQuarter.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }

    await updateQuarter.save();

    response.json(updateQuarter);
    return response;

  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteQuarter(header, response, idQuarter, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el trimestre. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Trimestres']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el Trimestre. No cuenta con los permisos suficientes.'});
  }

  const quarter = await privateGetQuarterById(idQuarter);
  if(!quarter) return response.status(404).json({ error: 'Error al eliminar el trimestre. Trimestre no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el trimestre. Usuario no encontrado.' });

  if(quarter.estado !== 'Eliminado'){
    quarter.estado = 'Eliminado'
    quarter.fechaEliminacion = new Date();
    quarter.eliminador = eliminador;
    quarter.observaciones = observaciones;
  }

  else{
    quarter.estado = 'Publicado'
    quarter.fechaEliminacion = null;
    quarter.eliminador = null;
    quarter.observaciones = null;
  }


  await quarter.save();

  response.json(quarter);
  return response;
}