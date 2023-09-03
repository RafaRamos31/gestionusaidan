import Subarea from "../models/subareas.js";
import { getAreaById } from "./areas-controller.js";

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

export async function createSubarea(nombre, idArea){
  const area = await getAreaById(idArea)
  const subarea = new Subarea({
    nombre,
    area
  })

  return subarea.save();
}

export async function editSubarea(idSubarea, nombre, idArea){
  const subarea = await getSubAreaById(idSubarea);
  if(!subarea) return null;

  const area = await getAreaById(idArea);
  subarea.nombre = nombre;
  subarea.area = area

  return subarea.save();
}

export async function deleteSubarea(idSubarea){
  const subarea = await getSubAreaById(idSubarea);
  if(!subarea) return null;

  return subarea.delete();
}