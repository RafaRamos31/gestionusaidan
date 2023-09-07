import Componente from "../models/componentes.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllComponentes(){
  return Componente.find();
}

export async function getComponentById(idComponente){
  try {
    const componente = await Componente.findById(idComponente);
    return componente;
  } catch (error) {
    throw error;
  }
}

export async function createComponente(nombre, idUsuario=null){
  const editor = await getUsuarioById(idUsuario);

  const componente = new Componente({
    nombre,
    ultimaEdicion: new Date(),
    editor
  })

  return componente.save();
}

export async function editComponente(idComponente, nombre, idUsuario=null){
  const componente = await getComponentById(idComponente);
  if(!componente) return null;

  const editor = await getUsuarioById(idUsuario);

  componente.nombre = nombre;
  componente.ultimaEdicion = new Date();
  componente.editor = editor;

  return componente.save();
}

export async function deleteComponente(idComponente){
  const componente = await getComponentById(idComponente);
  if(!componente) return null;

  return componente.delete();
}