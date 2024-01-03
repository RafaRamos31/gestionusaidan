import AreaInv from "../models/areasInv.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllAreasInv(){
  return AreaInv.find();
}

export async function getAreaInvById(idArea){
  try {
    const area = await AreaInv.findById(idArea);
    return area;
  } catch (error) {
    throw error;
  }
}

export async function createAreaInv(nombre, idUsuario=null){
  const editor = await getUsuarioById(idUsuario);
  const area = new AreaInv({
    nombre,
    ultimaEdicion: new Date(),
    editor
  })

  return area.save();
}

export async function editAreaInv(idArea, nombre, idUsuario=null){
  const area = await getAreaInvById(idArea);
  if(!area) return null;

  const editor = await getUsuarioById(idUsuario);

  area.nombre = nombre;
  area.ultimaEdicion = new Date();
  area.editor = editor;

  return area.save();
}

export async function deleteAreaInv(idArea){
  const area = await getAreaInvById(idArea);
  if(!area) return null;

  return area.delete();
}