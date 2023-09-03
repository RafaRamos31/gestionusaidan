import Caserio from "../models/caserios.js";
import { getAldeaById } from "./aldeas-controller.js";

export async function getCaseriosByAldea(idAldea=null){
  try {
    let filter = {}

    if(idAldea){
      filter = {aldea: {_id: idAldea}}
    }

    return Caserio.find(filter).sort({ geocode: 1 }).populate({path: 'aldea',
    populate: { path: 'municipio', populate: { path: 'departamento', model: 'Departamento'}}
  })
  } catch (error) {
    throw error;
  }
}

export async function getCaserioById(idCaserio){
  try {
    const caserio = await Caserio.findById(idCaserio).populate({path: 'aldea',
    populate: { path: 'municipio', populate: { path: 'departamento', model: 'Departamento'}}
    })
    return caserio;
  } catch (error) {
    throw error;
  }
}

export async function getCaserioByIdSimple(idCaserio){
  try {
    const caserio = await Caserio.findById(idCaserio);
    return caserio;
  } catch (error) {
    throw error;
  }
}

export async function createCaserio(nombre, geocode, idAldea){
  const aldea = await getAldeaById(idAldea)
  const caserio = new Caserio({
    nombre,
    geocode,
    aldea
  })

  return caserio.save();
}

export async function editCaserio(idCaserio, nombre, geocode, idAldea){
  const caserio = await getCaserioById(idCaserio);
  if(!caserio) return null;

  const aldea = await getAldeaById(idAldea);
  caserio.nombre = nombre;
  caserio.geocode = geocode;
  caserio.aldea = aldea;

  return caserio.save();
}

export async function deleteCaserio(idCaserio){
  const caserio = await getCaserioById(idCaserio);
  if(!caserio) return null;

  return caserio.delete();
}