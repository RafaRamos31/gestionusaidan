import Subarea from "../models/subareas.js";
import { getAreaById } from "./areas-controller.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getSubareasByArea(idArea=null){
  try {
    let filter = {}

    if(idArea){
      filter = {area: {_id: idArea}}
    }

    return Subarea.find(filter).populate('area');
  } catch (error) {
    throw error;
  }
}

export async function getSubAreaById(idSubarea){
  try {
    const subarea = await Subarea.findById(idSubarea).populate('area');
    return subarea;
  } catch (error) {
    throw error;
  }
}

export async function createSubarea(nombre, idArea, idUsuario=null){
  const area = await getAreaById(idArea);
  const editor = await getUsuarioById(idUsuario);

  const subarea = new Subarea({
    nombre,
    area,
    ultimaEdicion: new Date(),
    editor
  })

  return subarea.save();
}

export async function editSubarea(idSubarea, nombre, idArea, idUsuario=null){
  const subarea = await getSubAreaById(idSubarea);
  if(!subarea) return null;

  const editor = await getUsuarioById(idUsuario);

  const area = await getAreaById(idArea);
  subarea.nombre = nombre;
  subarea.area = area;
  subarea.ultimaEdicion = new Date();
  subarea.editor = editor;

  return subarea.save();
}

export async function deleteSubarea(idSubarea){
  const subarea = await getSubAreaById(idSubarea);
  if(!subarea) return null;

  return subarea.delete();
}