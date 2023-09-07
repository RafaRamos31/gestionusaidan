import Rol from "../models/roles.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllRoles(){
  return Rol.find();
}

export async function getRolById(idRol){
  try {
    const rol = await Rol.findById(idRol);
    return rol;
  } catch (error) {
    throw error;
  }
}

export async function createRol(nombre, idUsuario=null){
  const editor = await getUsuarioById(idUsuario);

  const rol = new Rol({
    nombre,
    ultimaEdicion: new Date(),
    editor
  })

  return rol.save();
}

export async function editRol(idRol, nombre, idUsuario=null){
  const rol = await getRolById(idRol);
  if(!rol) return null;

  const editor = await getUsuarioById(idUsuario);

  rol.nombre = nombre;
  rol.ultimaEdicion = new Date();
  rol.editor = editor;

  return rol.save();
}

export async function deleteRol(idRol){
  const rol = await getRolById(idRol);
  if(!rol) return null;

  return rol.delete();
}