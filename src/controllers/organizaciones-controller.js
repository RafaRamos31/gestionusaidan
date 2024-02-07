import Organizacion from "../models/organizaciones.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetAldeaById } from "./aldeas-controller.js";
import { privateGetCaserioById } from "./caserios-controller.js";
import { privateGetDepartamentoById } from "./departamentos-controller.js";
import { privateGetMunicipioById } from "./municipios-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetSectorById } from "./sectores-controllers.js";
import { privateGetTipoOrganizacionById } from "./tiposOrganizaciones-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";

//Internos para validacion de claves unicas
async function validateUniquesOrganizaciones({id=null, codigoOrganizacion = null}){
  let filter = {estado: 'Publicado'}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(codigoOrganizacion){
    filter = {...filter, codigoOrganizacion: codigoOrganizacion}
  }

  return Organizacion.exists(filter);
}

//Get internal
export async function privateGetOrganizacionById(idOrganizacion){
  try {
    return Organizacion.findById(idOrganizacion).populate([
      {
      path: 'sector tipoOrganizacion departamento municipio aldea caserio',
      select: '_id nombre',
      },
    ]);
  } catch (error) {
    throw error;
  }
}

//Get Count
export async function getCountOrganizaciones({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Organizaciones. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Organizaciones'] === false){
      return response.status(401).json({ error: 'Error al obtener Organizaciones. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Organizaciones']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Organizacion.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedOrganizaciones({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Organizaciones. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Organizaciones'] === false){
      return response.status(401).json({ error: 'Error al obtener Organizaciones. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Organizaciones']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const organizaciones = await Organizacion.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'sector tipoOrganizacion departamento municipio aldea caserio editor revisor eliminador',
      select: '_id nombre',
      }
    ]);

    response.json(organizaciones);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListOrganizaciones({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Organizaciones. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const organizaciones = await Organizacion.find(filterQuery, '_id nombre').sort(sortQuery);

    response.json(organizaciones);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getOrganizacionById(header, response, idOrganizacion){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Organización. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Clientes']['Organizaciones'] === false && rol.permisos.acciones['Organizaciones']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Organización. No cuenta con los permisos suficientes.'});
    }

    const organizacion = await Organizacion.findById(idOrganizacion).populate([
    {
      path: 'sector tipoOrganizacion departamento municipio aldea caserio editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(organizacion);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones organizacion
export async function getRevisionesOrganizacion(header, response, idOrganizacion){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Organización. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Organizaciones']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Organización. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Organizacion.find({original: {_id: idOrganizacion}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([
    {
      path: 'sector tipoOrganizacion departamento municipio aldea caserio editor revisor eliminador',
      select: '_id nombre',
    }]);
    
    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear organizacion
export async function createOrganizacion({header, response, nombre, codigoOrganizacion, idSector, idTipoOrganizacion, nivelOrganizacion, 
  idDepartamento, idMunicipio, idAldea, idCaserio, telefonoOrganizacion, nombreContacto, telefonoContacto, correoContacto, geolocacion, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear la organización. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Organizaciones']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear la organización. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear la organización. Usuario no encontrado.' });

    const existentCode = await validateUniquesOrganizaciones({codigoOrganizacion})
    if(existentCode) return response.status(400).json({ error: `Error al crear la organización. El código de organización ${codigoOrganizacion} ya está en uso.` });

    const promises = await Promise.all([
      privateGetSectorById(idSector),
      privateGetTipoOrganizacionById(idTipoOrganizacion),
      privateGetDepartamentoById(idDepartamento),
      privateGetMunicipioById(idMunicipio),
      privateGetAldeaById(idAldea),
      privateGetCaserioById(idCaserio)
    ])
    
    const baseOrganizacion = new Organizacion({
      //Propiedades de objeto
      nombre,
      codigoOrganizacion,
      sector: promises[0],
      tipoOrganizacion: promises[1],
      nivelOrganizacion,
      departamento: promises[2],
      municipio: promises[3],
      aldea: promises[4],
      caserio: promises[5],
      telefonoOrganizacion,
      nombreContacto,
      telefonoContacto,
      correoContacto,
      geolocacion,
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

    await baseOrganizacion.save();

    if(aprobar){
      const organizacion = new Organizacion({
        //Propiedades de objeto
        nombre,
        codigoOrganizacion,
        sector: promises[0],
        tipoOrganizacion: promises[1],
        nivelOrganizacion,
        departamento: promises[2],
        municipio: promises[3],
        aldea: promises[4],
        caserio: promises[5],
        telefonoOrganizacion,
        nombreContacto,
        telefonoContacto,
        correoContacto,
        geolocacion,
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
      
      baseOrganizacion.original = organizacion._id;
      baseOrganizacion.estado = 'Validado';
      baseOrganizacion.fechaRevision = new Date();
      baseOrganizacion.revisor = editor;

      await baseOrganizacion.save();

      organizacion.original = organizacion._id;
      await organizacion.save();
    }

    response.json(baseOrganizacion);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editOrganizacion({header, response, idOrganizacion, nombre, codigoOrganizacion, idSector, idTipoOrganizacion, nivelOrganizacion, 
  idDepartamento, idMunicipio, idAldea, idCaserio, telefonoOrganizacion, nombreContacto, telefonoContacto, correoContacto, geolocacion, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar la organización. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Organizaciones']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar la organización. No cuenta con los permisos suficientes.'});
    }

    const organizacion = await privateGetOrganizacionById(idOrganizacion);
    if(!organizacion) return response.status(404).json({ error: 'Error al editar la organización. Organización no encontrada.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar la organización. Usuario no encontrado.' });

    const existentCode = await validateUniquesOrganizaciones({codigoOrganizacion, id: idOrganizacion})
    if(existentCode) return response.status(400).json({ error: `Error al crear la organización. El código de organización ${codigoOrganizacion} ya está en uso.` });

    const promises = await Promise.all([
      privateGetSectorById(idSector),
      privateGetTipoOrganizacionById(idTipoOrganizacion),
      privateGetDepartamentoById(idDepartamento),
      privateGetMunicipioById(idMunicipio),
      privateGetAldeaById(idAldea),
      privateGetCaserioById(idCaserio)
    ])

    //Crear objeto de actualizacion
    const updateOrganizacion = new Organizacion({
      //Propiedades de objeto
      nombre,
      codigoOrganizacion,
      sector: promises[0],
      tipoOrganizacion: promises[1],
      nivelOrganizacion,
      departamento: promises[2],
      municipio: promises[3],
      aldea: promises[4],
      caserio: promises[5],
      telefonoOrganizacion,
      nombreContacto,
      telefonoContacto,
      correoContacto,
      geolocacion,
      //Propiedades de control
      original: organizacion._id,
      version: updateVersion(organizacion.ultimaRevision),
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
      organizacion.nombre = nombre;
      organizacion.codigoOrganizacion = codigoOrganizacion;
      organizacion.sector = promises[0];
      organizacion.tipoOrganizacion = promises[1];
      organizacion.nivelOrganizacion = nivelOrganizacion;
      organizacion.departamento = promises[2];
      organizacion.municipio = promises[3];
      organizacion.aldea = promises[4];
      organizacion.caserio = promises[5];
      organizacion.telefonoOrganizacion = telefonoOrganizacion;
      organizacion.nombreContacto = nombreContacto;
      organizacion.telefonoContacto = telefonoContacto;
      organizacion.correoContacto = correoContacto;
      organizacion.geolocacion = geolocacion;
      //Propiedades de control
      organizacion.version = updateVersion(organizacion.version, aprobar);
      organizacion.ultimaRevision = organizacion.version;
      organizacion.fechaEdicion = new Date();
      organizacion.editor = editor;
      organizacion.fechaRevision = new Date();
      organizacion.revisor = editor;
      organizacion.observaciones = null;
    }
    else{
      organizacion.pendientes = organizacion.pendientes.concat(editor._id);
      organizacion.ultimaRevision = updateVersion(organizacion.ultimaRevision)
    }
  
    await updateOrganizacion.save();
    await organizacion.save();

    response.json(updateOrganizacion);
    return response;

  } catch (error) {
    throw error;
  }
}



//Review
export async function revisarUpdateOrganizacion(header, response, idOrganizacion, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar la organización. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Organizaciones']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar la organización. No cuenta con los permisos suficientes.'});
    }

    const updateOrganizacion = await privateGetOrganizacionById(idOrganizacion);
    if(!updateOrganizacion) return response.status(404).json({ error: 'Error al revisar la organización. Revisión no encontrada.' });

    const original = await privateGetOrganizacionById(updateOrganizacion.original);
    if(!original && updateOrganizacion.version !== '0.1') return response.status(404).json({ error: 'Error al revisar la organización. Organización no encontrada.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar la organización. Usuario no encontrado.' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateOrganizacion.estado = 'Validado'
      updateOrganizacion.fechaRevision = new Date();
      updateOrganizacion.revisor = revisor;
      updateOrganizacion.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateOrganizacion.nombre;
        original.codigoOrganizacion = updateOrganizacion.codigoOrganizacion;
        original.sector = updateOrganizacion.sector;
        original.tipoOrganizacion = updateOrganizacion.tipoOrganizacion;
        original.nivelOrganizacion = updateOrganizacion.nivelOrganizacion;
        original.departamento = updateOrganizacion.departamento;
        original.municipio = updateOrganizacion.municipio;
        original.aldea = updateOrganizacion.aldea;
        original.caserio = updateOrganizacion.caserio;
        original.telefonoOrganizacion = updateOrganizacion.telefonoOrganizacion;
        original.nombreContacto = updateOrganizacion.nombreContacto;
        original.telefonoContacto = updateOrganizacion.telefonoContacto;
        original.correoContacto = updateOrganizacion.correoContacto;
        original.geolocacion = updateOrganizacion.geolocacion;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateOrganizacion.fechaEdicion;
        original.editor = updateOrganizacion.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const organizacion = new Organizacion({
          //Propiedades de objeto
          nombre: updateOrganizacion.nombre,
          codigoOrganizacion: updateOrganizacion.codigoOrganizacion,
          sector: updateOrganizacion.sector,
          tipoOrganizacion: updateOrganizacion.tipoOrganizacion,
          nivelOrganizacion: updateOrganizacion.nivelOrganizacion,
          departamento: updateOrganizacion.departamento,
          municipio: updateOrganizacion.municipio,
          aldea: updateOrganizacion.aldea,
          caserio: updateOrganizacion.caserio,
          telefonoOrganizacion: updateOrganizacion.telefonoOrganizacion,
          nombreContacto: updateOrganizacion.nombreContacto,
          telefonoContacto: updateOrganizacion.telefonoContacto,
          correoContacto: updateOrganizacion.correoContacto,
          geolocacion: updateOrganizacion.geolocacion,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateOrganizacion.fechaEdicion,
          editor: updateOrganizacion.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateOrganizacion.original = organizacion._id;
  
        await updateOrganizacion.save();
  
        organizacion.original = organizacion._id;
        await organizacion.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateOrganizacion.estado = 'Rechazado'
      updateOrganizacion.fechaRevision = new Date();
      updateOrganizacion.revisor = revisor;
      updateOrganizacion.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateOrganizacion.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateOrganizacion.save();

    response.json(updateOrganizacion);
    return response;
    
  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteOrganizacion(header, response, idOrganizacion, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar la organización. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Organizaciones']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar la organización. No cuenta con los permisos suficientes.'});
  }

  const organizacion = await privateGetOrganizacionById(idOrganizacion);
  if(!organizacion) return response.status(404).json({ error: 'Error al eliminar la organización. Organización no encontrada.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar la organización. Usuario no encontrado.' });

  if(organizacion.estado !== 'Eliminado'){
    organizacion.estado = 'Eliminado'
    organizacion.fechaEliminacion = new Date();
    organizacion.eliminador = eliminador;
    organizacion.observaciones = observaciones;
  }

  else{
    organizacion.estado = 'Publicado'
    organizacion.fechaEliminacion = null;
    organizacion.eliminador = null;
    organizacion.observaciones = null;
  }
  

  await organizacion.save();

  response.json(organizacion);
  return response;
}