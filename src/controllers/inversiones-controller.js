import Inversion from "../models/inversiones.js";
import { getAldeaByIdSimple } from "./aldeas-controller.js";
import { getAreaInvById } from "./areasInv-controller.js";
import { getCaserioByIdSimple } from "./caserios-controller.js";
import { getDepartamentoById } from "./departamentos-controller.js";
import { getMunicipioByIdSimple } from "./municipios-controller.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getInversionById(idInversion){
  try {
    const inversion = await Inversion.findById(idInversion).populate(['areaTematica', 
    'departamento', 'municipio', 'aldea', 'caserio']);
    return inversion;
  } catch (error) {
    throw error;
  }
}

export async function getInversiones(area=null, departamento=null, municipio=null, aldea=null, caserio=null){
  try {

    let filter = {}
    
    if(area){
      filter = {...filter, areaTematica: {_id: area}}
    }

    if(departamento){
      filter = {...filter, departamento: {_id: departamento}}
    }

    if(municipio){
      filter = {...filter, municipio: {_id: municipio}}
    }

    if(aldea){
      filter = {...filter, aldea: {_id: aldea}}
    }

    if(caserio){
      filter = {...filter, caserio: {_id: caserio}}
    }

    const inversiones = await Inversion.find(filter).populate(['areaTematica',
    'departamento', 'municipio', 'aldea', 'caserio']);
    return inversiones;
  } catch (error) {
    throw error;
  }
}

export async function createInversion(nombre, sector, idArea, idDepartamento, idMunicipio,
  idAldea, idCaserio, fecha, monto, idUsuario=null){

  const promises = await Promise.all([
    getAreaInvById(idArea),
    getDepartamentoById(idDepartamento),
    getMunicipioByIdSimple(idMunicipio),
    getAldeaByIdSimple(idAldea),
    getCaserioByIdSimple(idCaserio),
    getUsuarioById(idUsuario)
  ])

  const inversion = new Inversion({
    nombre,
    sector,
    areaTematica: promises[0],
    departamento: promises[1],
    municipio: promises[2],
    aldea: promises[3],
    caserio: promises[4],
    fecha,
    monto,
    ultimaEdicion: new Date(),
    editor: promises[5]
  })

  return inversion.save();
}


export async function editInversion(idInversion, nombre, sector, idArea, idDepartamento, idMunicipio,
  idAldea, idCaserio, fecha, monto, idUsuario=null){

  const inversion = await getInversionById(idInversion);
  if(!inversion) return null;

  const promises = await Promise.all([
    getAreaInvById(idArea),
    getDepartamentoById(idDepartamento),
    getMunicipioByIdSimple(idMunicipio),
    getAldeaByIdSimple(idAldea),
    getCaserioByIdSimple(idCaserio),
    getUsuarioById(idUsuario)
  ])

  inversion.nombre = nombre;
  inversion.sector = sector;
  inversion.areaTematica = promises[0];
  inversion.departamento = promises[1];
  inversion.municipio = promises[2];
  inversion.aldea = promises[3];
  inversion.caserio = promises[4];
  inversion.fecha = fecha,
  inversion.monto = monto,
  inversion.ultimaEdicion = new Date();
  inversion.editor = promises[5];

  return inversion.save();
}

export async function deleteInversion(idInversion){
  const inversion = await getInversionById(idInversion);
  if(!inversion) return null;

  return inversion.delete();
}