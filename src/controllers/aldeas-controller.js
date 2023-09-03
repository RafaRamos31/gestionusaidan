import Aldea from "../models/aldeas.js";
import { getMunicipioById } from '../controllers/municipios-controller.js'

export async function getAldeasByMunicipio(idMunicipio=null){
  try {
    let filter = {}

    if(idMunicipio){
      filter = {municipio: {_id: idMunicipio}}
    }
    return Aldea.find(filter).sort({ geocode: 1 }).populate('municipio')
    .populate({path: 'municipio', populate: {path:'departamento', model: 'Departamento'}});
  } catch (error) {
    throw error;
  }
  
}

export async function getAldeaById(idAldea){
  try {
    const aldea = await Aldea.findById(idAldea).populate('municipio')
    .populate({path: 'municipio', populate: {path:'departamento', model: 'Departamento'}});;
    return aldea;
  } catch (error) {
    throw error;
  }
}

export async function getAldeaByIdSimple(idAldea){
  try {
    const aldea = await Aldea.findById(idAldea);
    return aldea;
  } catch (error) {
    throw error;
  }
}

export async function createAldea(nombre, geocode, idMunicipio){
  const municipio = await getMunicipioById(idMunicipio)
  const aldea = new Aldea({
    nombre,
    geocode,
    municipio
  })

  return aldea.save();
}

export async function editAldea(idAldea, nombre, geocode, idMunicipio){
  const aldea = await getAldeaById(idAldea);
  if(!aldea) return null;

  const municipio = await getMunicipioById(idMunicipio);
  aldea.nombre = nombre;
  aldea.geocode = geocode;
  aldea.municipio = municipio;

  return aldea.save();
}

export async function deleteAldea(idAldea){
  const aldea = await getAldeaById(idAldea);
  if(!aldea) return null;

  return aldea.delete();
}