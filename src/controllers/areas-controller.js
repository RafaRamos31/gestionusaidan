import Area from "../models/areas.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllAreas(){
  return Area.find();
}

export async function getAreaById(idArea){
  try {
    const area = await Area.findById(idArea);
    return area;
  } catch (error) {
    throw error;
  }
}

export async function createArea(nombre, idUsuario=null){
  const editor = await getUsuarioById(idUsuario);
  const area = new Area({
    nombre,
    ultimaEdicion: new Date(),
    editor
  })

  return area.save();
}

export async function editArea(idArea, nombre, idUsuario=null){
  const area = await getAreaById(idArea);
  if(!area) return null;

  const editor = await getUsuarioById(idUsuario);

  area.nombre = nombre;
  area.ultimaEdicion = new Date();
  area.editor = editor;

  return area.save();
}

export async function deleteArea(idArea){
  const area = await getAreaById(idArea);
  if(!area) return null;

  return area.delete();
}