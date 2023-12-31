import Municipio from "../models/municipios.js";
import { getDepartamentoById } from "./departamentos-controller.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getMunicipiosByDepto(idDepto=null){
  try {
    let filter = {}

    if(idDepto){
      filter = {departamento: {_id: idDepto}}
    }

    return Municipio.find(filter).sort({ geocode: 1 }).populate('departamento');
  } catch (error) {
    throw error;
  }
}

export async function getMunicipioById(idMunicipio){
  try {
    const municipio = await Municipio.findById(idMunicipio).populate('departamento');
    return municipio;
  } catch (error) {
    throw error;
  }
}

export async function getMunicipioByIdSimple(idMunicipio){
  try {
    const municipio = await Municipio.findById(idMunicipio);
    return municipio;
  } catch (error) {
    throw error;
  }
}

export async function createMunicipio(nombre, geocode, idDepartamento, idUsuario=null){
  const departamento = await getDepartamentoById(idDepartamento)
  const editor = await getUsuarioById(idUsuario);

  const municipio = new Municipio({
    nombre,
    geocode,
    departamento,
    ultimaEdicion: new Date(),
    editor
  })

  return municipio.save();
}

export async function editMunicipio(idMunicipio, nombre, geocode, idDepartamento, idUsuario=null){
  const municipio = await getMunicipioById(idMunicipio);
  if(!municipio) return null;

  const departamento = await getDepartamentoById(idDepartamento);
  const editor = await getUsuarioById(idUsuario);

  municipio.nombre = nombre;
  municipio.geocode = geocode;
  municipio.departamento = departamento;
  municipio.ultimaEdicion = new Date();
  municipio.editor = editor;

  return municipio.save();
}

export async function deleteMunicipio(idMunicipio){
  const municipio = await getMunicipioById(idMunicipio);
  if(!municipio) return null;

  return municipio.delete();
}