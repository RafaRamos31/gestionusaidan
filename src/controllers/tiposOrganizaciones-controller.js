import TipoOrganizacion from "../models/tiposOrganizaciones.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllOrgTypes(){
  return TipoOrganizacion.find();
}

export async function getOrgTypeById(idOrgType){
  try {
    const orgType = await TipoOrganizacion.findById(idOrgType);
    return orgType;
  } catch (error) {
    throw error;
  }
}

export async function createOrgType(nombre, idUsuario=null){
  const editor = await getUsuarioById(idUsuario);

  const orgType = new TipoOrganizacion({
    nombre,
    ultimaEdicion: new Date,
    editor
  })

  return orgType.save();
}

export async function editOrgType(idOrgtype, nombre, idUsuario=null){
  const orgtype = await getOrgTypeById(idOrgtype);
  if(!orgtype) return null;

  const editor = await getUsuarioById(idUsuario);

  orgtype.nombre = nombre;
  orgtype.ultimaEdicion = new Date();
  orgtype.editor = editor;

  return orgtype.save();
}

export async function deleteOrgType(idOrgtype){
  const orgType = await getOrgTypeById(idOrgtype);
  if(!orgType) return null;

  return orgType.delete();
}