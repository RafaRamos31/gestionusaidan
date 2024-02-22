import SubResultado from "../models/subresultados.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetResultadoById } from "./resultados-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";

//Internos para validacion de claves unicas
async function validateUniquesSubResultados({id=null, nombre = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return SubResultado.exists(filter);
}

//Get internal
export async function privateGetSubresultadoById(idSubresultado){
  try {
    return SubResultado.findById(idSubresultado);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountSubResultados({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Subresultados. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Sub Resultados'] === false){
      return response.status(401).json({ error: 'Error al obtener Sub Resultados. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Sub Resultados']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await SubResultado.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedSubResultados({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Sub Resultados. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Sub Resultados'] === false){
      return response.status(401).json({ error: 'Error al obtener Sub Resultados. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Sub Resultados']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const subresultados = await SubResultado.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(subresultados);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListSubResultados({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Sub Resultados. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const subresultados = await SubResultado.find(filterQuery, '_id nombre descripcion').sort(sortQuery);

    response.json(subresultados);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getSubResultadoById(header, response, idSubresultado){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Sub Resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Sub Resultados'] === false && rol.permisos.acciones['Sub Resultados']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Sub Resultado. No cuenta con los permisos suficientes.'});
    }

    const subresultado = await SubResultado.findById(idSubresultado).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(subresultado);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones subresultado
export async function getRevisionesSubResultado(header, response, idSubresultado){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Sub Resultado. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Resultados']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Sub Resultado. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await SubResultado.find({original: {_id: idSubresultado}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor',
      select: '_id nombre',
    }]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear subresultado
export async function createSubResultado(header, response, nombre, descripcion, idResultado, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el Sub Resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Resultados']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el Sub Resultado. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el subresultado. Usuario no encontrado.' });

    const existentNombre = await validateUniquesSubResultados({nombre})
    if(existentNombre) return response.status(400).json({ error: `Error al crear el subresultado. El código ${nombre} ya está en uso.` });

    const resultado = await privateGetResultadoById(idResultado)

    const baseSubresultado = new SubResultado({
      //Propiedades de objeto
      nombre,
      descripcion,
      resultado,
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

    await baseSubresultado.save();

    if(aprobar){
      const subresultado = new SubResultado({
        //Propiedades de objeto
        nombre,
        descripcion,
        resultado,
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
      
      baseSubresultado.original = subresultado._id;
      baseSubresultado.estado = 'Validado';
      baseSubresultado.fechaRevision = new Date();
      baseSubresultado.revisor = editor;

      await baseSubresultado.save();

      subresultado.original = subresultado._id;
      await subresultado.save();
    }

    response.json(baseSubresultado);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editSubresultado(header, response, idSubresultado, nombre, descripcion, idResultado, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el Sub Resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Resultados']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el Sub Resultado. No cuenta con los permisos suficientes.'});
    }

    const subresultado = await privateGetSubresultadoById(idSubresultado);
    if(!subresultado) return response.status(404).json({ error: 'Error al editar el subresultado. Subresultado no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el subresultado. Usuario no encontrado' });

    const existentNombre = await validateUniquesSubResultados({nombre, id: idSubresultado})
    if(existentNombre) return response.status(400).json({ error: `Error al editar el subresultado. El código ${nombre} ya está en uso.` });

    const resultado = await privateGetResultadoById(idResultado);

    //Crear objeto de actualizacion
    const updateSubresultado = new SubResultado({
      //Propiedades de objeto
      nombre,
      descripcion,
      resultado,
      //Propiedades de control
      original: subresultado._id,
      version: updateVersion(subresultado.ultimaRevision),
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
      subresultado.nombre = nombre;
      subresultado.descripcion = descripcion;
      subresultado.resultado = resultado;
      //Propiedades de control
      subresultado.version = updateVersion(subresultado.version, aprobar);
      subresultado.ultimaRevision = subresultado.version;
      subresultado.fechaEdicion = new Date();
      subresultado.editor = editor;
      subresultado.fechaRevision = new Date();
      subresultado.revisor = editor;
      subresultado.observaciones = null;
    }
    else{
      subresultado.pendientes = subresultado.pendientes.concat(editor._id);
      subresultado.ultimaRevision = updateVersion(subresultado.ultimaRevision)
    }
  
    await updateSubresultado.save();
    await subresultado.save();

    response.json(updateSubresultado);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateSubresultado(header, response, idSubresultado, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el Sub Resultado. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Resultados']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el Sub Resultado. No cuenta con los permisos suficientes.'});
    }

    const updateSubresultado = await privateGetSubresultadoById(idSubresultado);
    if(!updateSubresultado) return response.status(404).json({ error: 'Error al revisar el subresultado. Revisión no encontrada.' });

    const original = await privateGetSubresultadoById(updateSubresultado.original);
    if(!original && updateSubresultado.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el subresultado. Subresultado no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el subresultado. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateSubresultado.estado = 'Validado'
      updateSubresultado.fechaRevision = new Date();
      updateSubresultado.revisor = revisor;
      updateSubresultado.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateSubresultado.nombre;
        original.descripcion = updateSubresultado.descripcion;
        original.resultado = updateSubresultado.resultado;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateSubresultado.fechaEdicion;
        original.editor = updateSubresultado.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const subresultado = new SubResultado({
          //Propiedades de objeto
          nombre: updateSubresultado.nombre,
          descripcion: updateSubresultado.descripcion,
          resultado: updateSubresultado.resultado,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateSubresultado.fechaEdicion,
          editor: updateSubresultado.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateSubresultado.original = subresultado._id;
  
        await updateSubresultado.save();
  
        subresultado.original = subresultado._id;
        await subresultado.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateSubresultado.estado = 'Rechazado'
      updateSubresultado.fechaRevision = new Date();
      updateSubresultado.revisor = revisor;
      updateSubresultado.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateSubresultado.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateSubresultado.save();

    response.json(updateSubresultado);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteSubresultado(header, response, idSubresultado, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el subresultado. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Sub Resultados']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el Sub Resultado. No cuenta con los permisos suficientes.'});
  }

  const subresultado = await privateGetSubresultadoById(idSubresultado);
  if(!subresultado) return response.status(404).json({ error: 'Error al eliminar el subresultado. Subresultado no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el subresultado. Usuario no encontrado.' });

  if(subresultado.estado !== 'Eliminado'){
    subresultado.estado = 'Eliminado'
    subresultado.fechaEliminacion = new Date();
    subresultado.eliminador = eliminador;
    subresultado.observaciones = observaciones;
  }

  else{
    subresultado.estado = 'Publicado'
    subresultado.fechaEliminacion = null;
    subresultado.eliminador = null;
    subresultado.observaciones = null;
  }
  

  await subresultado.save();

  response.json(subresultado);
  return response;
}