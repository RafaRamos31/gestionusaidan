import SubActividad from "../models/subactividades.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";

//Internos para validacion de claves unicas
async function validateUniquesSubActividades({id=null, nombre = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return SubActividad.exists(filter);
}

//Get internal
export async function privateGetSubActividadById(idSubactividad){
  try {
    return SubActividad.findById(idSubactividad);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountSubActividades({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener sub actividades. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Sub Actividades'] === false){
      return response.status(401).json({ error: 'Error al obtener Sub Actividades. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Sub Actividades']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await SubActividad.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedSubActividades({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener SubActividades. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Sub Actividades'] === false){
      return response.status(401).json({ error: 'Error al obtener Sub Actividades. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Sub Actividades']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const subactividades = await SubActividad.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado actividad areasTematicas componentes',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(subactividades);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListSubActividades({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener sub-actividades. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const subactividades = await SubActividad.find(filterQuery, '_id nombre descripcion').sort(sortQuery);

    response.json(subactividades);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getSubActividadById(header, response, idSubActividad){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener SubActividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Sub Actividades'] === false && rol.permisos.acciones['Sub Actividades']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Sub Actividad. No cuenta con los permisos suficientes.'});
    }

    const subactividad = await SubActividad.findById(idSubActividad).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado actividad areasTematicas componentes',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(subactividad);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones subresultado
export async function getRevisionesSubActividades(header, response, idSubActividad){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de SubActividad. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Actividades']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Sub Actividad. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await SubActividad.find({original: {_id: idSubActividad}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    },
    {
      path: 'resultado subresultado actividad areasTematicas componentes',
      select: '_id nombre descripcion',
    },
  ]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear actividad
export async function createSubActividad(header, response, nombre, descripcion, idResultado, idSubresultado, idActividad, componentes, areasTematicas, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear la sub-actividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Actividades']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Sub Actividad. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear la actividad. Usuario no encontrado.' });

    const existentNombre = await validateUniquesSubActividades({nombre})
    if(existentNombre) return response.status(400).json({ error: `Error al crear la actividad. El código ${nombre} ya está en uso.` });

    const baseSubactividad = new SubActividad({
      //Propiedades de objeto
      nombre,
      descripcion,
      resultado: idResultado,
      subresultado: idSubresultado,
      actividad: idActividad,
      componentes,
      areasTematicas,
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

    await baseSubactividad.save();

    if(aprobar){
      const subactividad = new SubActividad({
        //Propiedades de objeto
        nombre,
        descripcion,
        resultado: idResultado,
        subresultado: idSubresultado,
        actividad: idActividad,
        componentes,
        areasTematicas,
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
      
      baseSubactividad.original = subactividad._id;
      baseSubactividad.estado = 'Validado';
      baseSubactividad.fechaRevision = new Date();
      baseSubactividad.revisor = editor;

      await baseSubactividad.save();

      subactividad.original = subactividad._id;
      await subactividad.save();
    }

    response.json(baseSubactividad);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editSubActividad(header, response, idSubactividad, nombre, descripcion, idResultado, idSubresultado, idActividad, componentes, areasTematicas, aprobar=false){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar la sub-actividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Actividades']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar Sub Actividad. No cuenta con los permisos suficientes.'});
    }

    const subactividad = await privateGetSubActividadById(idSubactividad);
    if(!subactividad) return response.status(404).json({ error: 'Error al editar la sub-actividad. Sub-actividad no encontrada' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar la sub-actividad. Usuario no encontrado' });

    const existentNombre = await validateUniquesSubActividades({nombre, id: idSubactividad})
    if(existentNombre) return response.status(400).json({ error: `Error al editar la sub-actividad. El código ${nombre} ya está en uso.` });

    //Crear objeto de actualizacion
    const updateSubactividad = new SubActividad({
      //Propiedades de objeto
      nombre,
      descripcion,
      resultado: idResultado,
      subresultado: idSubresultado,
      actividad: idActividad,
      componentes,
      areasTematicas,
      //Propiedades de control
      original: subactividad._id,
      version: updateVersion(subactividad.ultimaRevision),
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
      subactividad.nombre = nombre;
      subactividad.descripcion = descripcion;
      subactividad.resultado = idResultado;
      subactividad.subresultado = idSubresultado;
      subactividad.actividad = idActividad;
      subactividad.componentes = componentes;
      subactividad.areasTematicas = areasTematicas;
      //Propiedades de control
      subactividad.version = updateVersion(subactividad.version, aprobar);
      subactividad.ultimaRevision = subactividad.version;
      subactividad.fechaEdicion = new Date();
      subactividad.editor = editor;
      subactividad.fechaRevision = new Date();
      subactividad.revisor = editor;
      subactividad.observaciones = null;
    }
    else{
      subactividad.pendientes = subactividad.pendientes.concat(editor._id);
      subactividad.ultimaRevision = updateVersion(subactividad.ultimaRevision)
    }
  
    await updateSubactividad.save();
    await subactividad.save();

    response.json(updateSubactividad);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateSubactividad(header, response, idSubActividad, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar la sub-actividad. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Sub Actividades']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Sub Actividad. No cuenta con los permisos suficientes.'});
    }

    const updateSubactividad = await privateGetSubActividadById(idSubActividad);
    if(!updateSubactividad) return response.status(404).json({ error: 'Error al revisar la sub-actividad. Revisión no encontrada.' });

    const original = await privateGetSubActividadById(updateSubactividad.original);
    if(!original && updateSubactividad.version !== '0.1') return response.status(404).json({ error: 'Error al revisar la sub-actividad. Sub-Actividad no encontrada.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar la sub-actividad. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateSubactividad.estado = 'Validado'
      updateSubactividad.fechaRevision = new Date();
      updateSubactividad.revisor = revisor;
      updateSubactividad.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateSubactividad.nombre;
        original.descripcion = updateSubactividad.descripcion;
        original.resultado = updateSubactividad.resultado;
        original.subresultado = updateSubactividad.subresultado;
        original.actividad = updateSubactividad.actividad;
        original.componentes = updateSubactividad.componentes;
        original.areasTematicas = updateSubactividad.areasTematicas;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateSubactividad.fechaEdicion;
        original.editor = updateSubactividad.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const subactividad = new SubActividad({
          //Propiedades de objeto
          nombre: updateSubactividad.nombre,
          descripcion: updateSubactividad.descripcion,
          resultado: updateSubactividad.resultado,
          subresultado: updateSubactividad.subresultado,
          actividad: updateSubactividad.actividad,
          componentes: updateSubactividad.componentes,
          areasTematicas: updateSubactividad.areasTematicas,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateSubactividad.fechaEdicion,
          editor: updateSubactividad.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateSubactividad.original = subactividad._id;
  
        await updateSubactividad.save();
  
        subactividad.original = subactividad._id;
        await subactividad.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateSubactividad.estado = 'Rechazado'
      updateSubactividad.fechaRevision = new Date();
      updateSubactividad.revisor = revisor;
      updateSubactividad.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateSubactividad.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateSubactividad.save();

    response.json(updateSubactividad);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteSubActividad(header, response, idSubActividad, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar la sub-actividad. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Sub Actividades']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar Sub Actividad. No cuenta con los permisos suficientes.'});
  }

  const subactividad = await privateGetSubActividadById(idSubActividad);
  if(!subactividad) return response.status(404).json({ error: 'Error al eliminar la sub-actividad. Sub-Actividad no encontrada.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar la sub-actividad. Usuario no encontrado.' });

  if(subactividad.estado !== 'Eliminado'){
    subactividad.estado = 'Eliminado'
    subactividad.fechaEliminacion = new Date();
    subactividad.eliminador = eliminador;
    subactividad.observaciones = observaciones;
  }

  else{
    subactividad.estado = 'Publicado'
    subactividad.fechaEliminacion = null;
    subactividad.eliminador = null;
    subactividad.observaciones = null;
  }
  

  await subactividad.save();

  response.json(subactividad);
  return response;
}