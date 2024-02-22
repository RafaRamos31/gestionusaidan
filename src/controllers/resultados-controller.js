import Resultado from "../models/resultados.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";

//Internos para validacion de claves unicas
async function validateUniquesResultados({id=null, nombre = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Resultado.exists(filter);
}

//Get internal
export async function privateGetResultadoById(idResultado){
  try {
    return Resultado.findById(idResultado);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountResultados({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Resultados. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Resultados'] === false){
      return response.status(401).json({ error: 'Error al obtener Resultados. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Resultados']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Resultado.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedResultados({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Resultados. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Resultados'] === false){
      return response.status(401).json({ error: 'Error al obtener Resultados. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Resultados']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const resultados = await Resultado.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(resultados);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListResultados({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Resultados. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const resultados = await Resultado.find(filterQuery, '_id nombre descripcion').sort(sortQuery);

    response.json(resultados);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getResultadoById(header, response, idResultado){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Resultados'] === false && rol.permisos.acciones['Resultados']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Resultado. No cuenta con los permisos suficientes.'});
    }

    const resultado = await Resultado.findById(idResultado).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(resultado);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones depto
export async function getRevisionesResultado(header, response, idResultado){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Resultado. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Resultados']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Resultado. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Resultado.find({original: {_id: idResultado}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
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
export async function createResultado(header, response, nombre, descripcion, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Resultados']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el resultado. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el resultado. Usuario no encontrado.' });

    const existentNombre = await validateUniquesResultados({nombre})
    if(existentNombre) return response.status(400).json({ error: `Error al crear el resultado. El código ${nombre} ya está en uso.` });

    const baseResultado = new Resultado({
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

    await baseResultado.save();

    if(aprobar){
      const resultado = new Resultado({
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
      
      baseResultado.original = resultado._id;
      baseResultado.estado = 'Validado';
      baseResultado.fechaRevision = new Date();
      baseResultado.revisor = editor;

      await baseResultado.save();

      resultado.original = resultado._id;
      await resultado.save();
    }

    response.json(baseResultado);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editResultado(header, response, idResultado, nombre, descripcion, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Resultados']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el departamento. No cuenta con los permisos suficientes.'});
    }

    const resultado = await privateGetResultadoById(idResultado);
    if(!resultado) return response.status(404).json({ error: 'Error al editar el resultado. Resultado no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el resultado. Usuario no encontrado' });

    const existentNombre = await validateUniquesResultados({nombre, id: idResultado})
    if(existentNombre) return response.status(400).json({ error: `Error al editar el resultado. El código ${nombre} ya está en uso.` });

    //Crear objeto de actualizacion
    const updateResultado = new Resultado({
      //Propiedades de objeto
      nombre,
      descripcion,
      //Propiedades de control
      original: resultado._id,
      version: updateVersion(resultado.ultimaRevision),
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
      resultado.nombre = nombre;
      resultado.descripcion = descripcion;
      //Propiedades de control
      resultado.version = updateVersion(resultado.version, aprobar);
      resultado.ultimaRevision = resultado.version;
      resultado.fechaEdicion = new Date();
      resultado.editor = editor;
      resultado.fechaRevision = new Date();
      resultado.revisor = editor;
      resultado.observaciones = null;
    }
    else{
      resultado.pendientes = resultado.pendientes.concat(editor._id);
      resultado.ultimaRevision = updateVersion(resultado.ultimaRevision)
    }
  
    await updateResultado.save();
    await resultado.save();

    response.json(updateResultado);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateResultado(header, response, idResultado, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Resultados']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el departamento. No cuenta con los permisos suficientes.'});
    }

    const updateResultado = await privateGetResultadoById(idResultado);
    if(!updateResultado) return response.status(404).json({ error: 'Error al revisar el resultado. Revisión no encontrada.' });

    const original = await privateGetResultadoById(updateResultado.original);
    if(!original && updateResultado.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el resultado. Resultado no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el resultado. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateResultado.estado = 'Validado'
      updateResultado.fechaRevision = new Date();
      updateResultado.revisor = revisor;
      updateResultado.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateResultado.nombre;
        original.descripcion = updateResultado.descripcion;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateResultado.fechaEdicion;
        original.editor = updateResultado.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const resultado = new Resultado({
          //Propiedades de objeto
          nombre: updateResultado.nombre,
          descripcion: updateResultado.descripcion,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateResultado.fechaEdicion,
          editor: updateResultado.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateResultado.original = resultado._id;
  
        await updateResultado.save();
  
        resultado.original = resultado._id;
        await resultado.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateResultado.estado = 'Rechazado'
      updateResultado.fechaRevision = new Date();
      updateResultado.revisor = revisor;
      updateResultado.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateResultado.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateResultado.save();

    response.json(updateResultado);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteResultado(header, response, idResultado, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el resultado. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Resultados']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el resultado. No cuenta con los permisos suficientes.'});
  }

  const resultado = await privateGetResultadoById(idResultado);
  if(!resultado) return response.status(404).json({ error: 'Error al eliminar el resultado. Resultado no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el resultado. Usuario no encontrado.' });

  if(resultado.estado !== 'Eliminado'){
    resultado.estado = 'Eliminado'
    resultado.fechaEliminacion = new Date();
    resultado.eliminador = eliminador;
    resultado.observaciones = observaciones;
  }

  else{
    resultado.estado = 'Publicado'
    resultado.fechaEliminacion = null;
    resultado.eliminador = null;
    resultado.observaciones = null;
  }
  

  await resultado.save();

  response.json(resultado);
  return response;
}