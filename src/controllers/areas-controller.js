import Area from "../models/areas.js";

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

export async function createArea(nombre){
  const area = new Area({
    nombre
  })

  return area.save();
}

export async function editArea(idArea, nombre){
  const area = await getAreaById(idArea);
  if(!area) return null;

  area.nombre = nombre;

  return area.save();
}

export async function deleteArea(idArea){
  const area = await getAreaById(idArea);
  if(!area) return null;

  return area.delete();
}