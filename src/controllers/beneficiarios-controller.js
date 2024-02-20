import Beneficiario from "../models/beneficiarios.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetAldeaById } from "./aldeas-controller.js";
import { privateGetCargoById } from "./cargos-controller.js";
import { privateGetCaserioById } from "./caserios-controller.js";
import { privateGetDepartamentoById } from "./departamentos-controller.js";
import { privateGetMunicipioById } from "./municipios-controller.js";
import { privateGetOrganizacionById } from "./organizaciones-controller.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetSectorById } from "./sectores-controllers.js";
import { privateGetTipoOrganizacionById } from "./tiposOrganizaciones-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";

//Internos para validacion de claves unicas
async function validateUniquesBeneficiarios({id=null, dni=null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(dni){
    filter = {...filter, dni: dni}
  }

  return Beneficiario.exists(filter);
}

//Get internal
export async function privateGetBeneficiarioById(idBeneficiario){
  try {
    return Beneficiario.findById(idBeneficiario).populate([
      {
      path: 'sector tipoOrganizacion organizacion cargo departamento municipio aldea caserio',
      select: '_id nombre',
      },
    ]);
  } catch (error) {
    throw error;
  }
}

//Get Count
export async function getCountBeneficiarios({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Beneficiarios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Beneficiarios'] === false){
      return response.status(401).json({ error: 'Error al obtener Beneficiarios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Beneficiarios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Beneficiario.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedBeneficiarios({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Beneficiarios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Clientes']['Beneficiarios'] === false){
      return response.status(401).json({ error: 'Error al obtener Beneficiarios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Beneficiarios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const beneficiarios = await Beneficiario.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'sector tipoOrganizacion organizacion cargo departamento municipio aldea caserio editor revisor eliminador',
      select: '_id nombre',
      }
    ]);

    response.json(beneficiarios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListBeneficiarios({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Beneficiarios. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const beneficiarios = await Beneficiario.find(filterQuery, '_id nombre dni').limit(50).sort(sortQuery);

    response.json(beneficiarios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getBeneficiarioById(header, response, idBeneficiario){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Beneficiario. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Clientes']['Beneficiarios'] === false && rol.permisos.acciones['Beneficiarios']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Beneficiario. No cuenta con los permisos suficientes.'});
    }

    const beneficiario = await Beneficiario.findById(idBeneficiario).populate([
    {
      path: 'sector tipoOrganizacion organizacion cargo departamento municipio aldea caserio editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(beneficiario);
    return response;

  } catch (error) {
    throw error;
  }
}


export async function getBeneficiarioByDNI(header, response, dniBeneficiario){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Beneficiario. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Clientes']['Beneficiarios'] === false && rol.permisos.acciones['Beneficiarios']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Beneficiario. No cuenta con los permisos suficientes.'});
    }

    const beneficiario = await Beneficiario.find({dni: dniBeneficiario, estado: 'Publicado'}).populate([
    {
      path: 'sector tipoOrganizacion organizacion cargo departamento municipio aldea caserio editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(beneficiario);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones organizacion
export async function getRevisionesBeneficiario(header, response, idBeneficiario){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Beneficiario. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Beneficiarios']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Beneficiario. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Beneficiario.find({original: {_id: idBeneficiario}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([
    {
      path: 'sector tipoOrganizacion organizacion cargo departamento municipio aldea caserio editor revisor eliminador',
      select: '_id nombre',
    }]);
    
    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear beneficiario
export async function createBeneficiario({header, response, nombre, sexo, fechaNacimiento, dni, idSector, idTipoOrganizacion, idOrganizacion, idCargo, 
  telefono, idDepartamento, idMunicipio, idAldea, idCaserio, geolocacion, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear Beneficiario. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Beneficiarios']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Beneficiario. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear Beneficiario. Usuario no encontrado.' });

    const existentDNI = await validateUniquesBeneficiarios({dni})
    if(existentDNI) return response.status(400).json({ error: `Error al crear Beneficiario. El DNI ${dni} ya está en uso.` });

    const promises = await Promise.all([
      privateGetSectorById(idSector),
      privateGetTipoOrganizacionById(idTipoOrganizacion),
      privateGetOrganizacionById(idOrganizacion),
      privateGetCargoById(idCargo),
      privateGetDepartamentoById(idDepartamento),
      privateGetMunicipioById(idMunicipio),
      privateGetAldeaById(idAldea),
      privateGetCaserioById(idCaserio)
    ])
    
    const baseBeneficiario = new Beneficiario({
      //Propiedades de objeto
      nombre,
      sexo,
      fechaNacimiento: new Date(fechaNacimiento),
      dni,
      sector: promises[0],
      tipoOrganizacion: promises[1],
      organizacion: promises[2],
      cargo: promises[3],
      telefono,
      departamento: promises[4],
      municipio: promises[5],
      aldea: promises[6],
      caserio: promises[7],
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

    await baseBeneficiario.save();

    if(aprobar){
      const beneficiario = new Beneficiario({
        //Propiedades de objeto
        nombre,
        sexo,
        fechaNacimiento: new Date(fechaNacimiento),
        dni,
        sector: promises[0],
        tipoOrganizacion: promises[1],
        organizacion: promises[2],
        cargo: promises[3],
        telefono,
        departamento: promises[4],
        municipio: promises[5],
        aldea: promises[6],
        caserio: promises[7],
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
      
      baseBeneficiario.original = beneficiario._id;
      baseBeneficiario.estado = 'Validado';
      baseBeneficiario.fechaRevision = new Date();
      baseBeneficiario.revisor = editor;

      await baseBeneficiario.save();

      beneficiario.original = beneficiario._id;
      await beneficiario.save();
    }

    response.json(baseBeneficiario);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editBeneficiario({header, response, idBeneficiario, nombre, sexo, fechaNacimiento, dni, idSector, idTipoOrganizacion, 
  idOrganizacion, idCargo, telefono, idDepartamento, idMunicipio, idAldea, idCaserio, geolocacion, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar Beneficiario. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Beneficiarios']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar Beneficiario. No cuenta con los permisos suficientes.'});
    }

    const beneficiario = await privateGetBeneficiarioById(idBeneficiario);
    if(!beneficiario) return response.status(404).json({ error: 'Error al editar Beneficiario. Beneficiario no encontrado.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar Beneficiario. Usuario no encontrado.' });

    const existentDNI = await validateUniquesBeneficiarios({dni, id: idBeneficiario})
    if(existentDNI) return response.status(400).json({ error: `Error al editar Beneficiario. El DNI ${dni} ya está en uso.` });

    const promises = await Promise.all([
      privateGetSectorById(idSector),
      privateGetTipoOrganizacionById(idTipoOrganizacion),
      privateGetOrganizacionById(idOrganizacion),
      privateGetCargoById(idCargo),
      privateGetDepartamentoById(idDepartamento),
      privateGetMunicipioById(idMunicipio),
      privateGetAldeaById(idAldea),
      privateGetCaserioById(idCaserio)
    ])

    //Crear objeto de actualizacion
    const updateBeneficiario = new Beneficiario({
      //Propiedades de objeto
      nombre,
      sexo,
      fechaNacimiento: new Date(fechaNacimiento),
      dni,
      sector: promises[0],
      tipoOrganizacion: promises[1],
      organizacion: promises[2],
      cargo: promises[3],
      telefono,
      departamento: promises[4],
      municipio: promises[5],
      aldea: promises[6],
      caserio: promises[7],
      geolocacion,
      //Propiedades de control
      original: beneficiario._id,
      version: updateVersion(beneficiario.ultimaRevision),
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
      beneficiario.nombre = nombre;
      beneficiario.sexo = sexo;
      beneficiario.fechaNacimiento = new Date(fechaNacimiento);
      beneficiario.dni = dni;
      beneficiario.sector = promises[0];
      beneficiario.tipoOrganizacion = promises[1];
      beneficiario.organizacion = promises[2];
      beneficiario.cargo = promises[3];
      beneficiario.telefono = telefono;
      beneficiario.departamento = promises[4];
      beneficiario.municipio = promises[5];
      beneficiario.aldea = promises[6];
      beneficiario.caserio = promises[7];
      beneficiario.geolocacion = geolocacion;
      //Propiedades de control
      beneficiario.version = updateVersion(beneficiario.version, aprobar);
      beneficiario.ultimaRevision = beneficiario.version;
      beneficiario.fechaEdicion = new Date();
      beneficiario.editor = editor;
      beneficiario.fechaRevision = new Date();
      beneficiario.revisor = editor;
      beneficiario.observaciones = null;
    }
    else{
      beneficiario.pendientes = beneficiario.pendientes.concat(editor._id);
      beneficiario.ultimaRevision = updateVersion(beneficiario.ultimaRevision)
    }
  
    await updateBeneficiario.save();
    await beneficiario.save();

    response.json(updateBeneficiario);
    return response;

  } catch (error) {
    throw error;
  }
}



//Review
export async function revisarUpdateBeneficiario(header, response, idBeneficiario, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar Beneficiario. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Beneficiarios']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Beneficiario. No cuenta con los permisos suficientes.'});
    }

    const updateBeneficiario = await privateGetBeneficiarioById(idBeneficiario);
    if(!updateBeneficiario) return response.status(404).json({ error: 'Error al revisar Beneficiario. Revisión no encontrada.' });

    const original = await privateGetBeneficiarioById(updateBeneficiario.original);
    if(!original && updateBeneficiario.version !== '0.1') return response.status(404).json({ error: 'Error al revisar Beneficiario. Beneficiario no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar Beneficiario. Usuario no encontrado.' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateBeneficiario.estado = 'Validado'
      updateBeneficiario.fechaRevision = new Date();
      updateBeneficiario.revisor = revisor;
      updateBeneficiario.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateBeneficiario.nombre;
        original.sexo = updateBeneficiario.sexo;
        original.fechaNacimiento = updateBeneficiario.fechaNacimiento;
        original.dni = updateBeneficiario.dni;
        original.sector = updateBeneficiario.sector;
        original.tipoOrganizacion = updateBeneficiario.tipoOrganizacion;
        original.organizacion = updateBeneficiario.organizacion;
        original.cargo = updateBeneficiario.cargo;
        original.telefono = updateBeneficiario.telefono;
        original.departamento = updateBeneficiario.departamento;
        original.municipio = updateBeneficiario.municipio;
        original.aldea = updateBeneficiario.aldea;
        original.caserio = updateBeneficiario.caserio;
        original.geolocacion = updateBeneficiario.geolocacion;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateBeneficiario.fechaEdicion;
        original.editor = updateBeneficiario.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const beneficario = new Beneficiario({
          //Propiedades de objeto
          nombre: updateBeneficiario.nombre,
          sexo: updateBeneficiario.sexo,
          fechaNacimiento: updateBeneficiario.fechaNacimiento,
          dni: updateBeneficiario.dni,
          sector: updateBeneficiario.sector,
          tipoOrganizacion: updateBeneficiario.tipoOrganizacion,
          organizacion: updateBeneficiario.organizacion,
          cargo: updateBeneficiario.cargo,
          telefono: updateBeneficiario.telefono,
          departamento: updateBeneficiario.departamento,
          municipio: updateBeneficiario.municipio,
          aldea: updateBeneficiario.aldea,
          caserio: updateBeneficiario.caserio,
          geolocacion: updateBeneficiario.geolocacion,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateBeneficiario.fechaEdicion,
          editor: updateBeneficiario.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateBeneficiario.original = beneficario._id;
  
        await updateBeneficiario.save();
  
        beneficario.original = beneficario._id;
        await beneficario.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateBeneficiario.estado = 'Rechazado'
      updateBeneficiario.fechaRevision = new Date();
      updateBeneficiario.revisor = revisor;
      updateBeneficiario.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateBeneficiario.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateBeneficiario.save();

    response.json(updateBeneficiario);
    return response;
    
  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteBeneficiario(header, response, idBeneficiario, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar Beneficiario. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Beneficiarios']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar Beneficiario. No cuenta con los permisos suficientes.'});
  }

  const beneficario = await privateGetBeneficiarioById(idBeneficiario);
  if(!beneficario) return response.status(404).json({ error: 'Error al eliminar Beneficiario. Beneficiario no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar Beneficiario. Usuario no encontrado.' });

  if(beneficario.estado !== 'Eliminado'){
    beneficario.estado = 'Eliminado'
    beneficario.fechaEliminacion = new Date();
    beneficario.eliminador = eliminador;
    beneficario.observaciones = observaciones;
  }

  else{
    beneficario.estado = 'Publicado'
    beneficario.fechaEliminacion = null;
    beneficario.eliminador = null;
    beneficario.observaciones = null;
  }
  

  await beneficario.save();

  response.json(beneficario);
  return response;
}