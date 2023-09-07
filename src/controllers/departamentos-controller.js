import Departamento from "../models/departamentos.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllDepartamentos(){
  return Departamento.find().sort({ geocode: 1 });
}

export async function getDepartamentoById(idDepartamento){
  try {
    const departamento = await Departamento.findById(idDepartamento);
    return departamento;
  } catch (error) {
    throw error;
  }
}

export async function createDepartamento(nombre, geocode, idUsuario=null){
  const editor = await getUsuarioById(idUsuario);

  const departamento = new Departamento({
    nombre,
    geocode,
    ultimaEdicion: new Date(),
    editor
  })

  return departamento.save();
}

export async function editDepartamento(idDepartamento, nombre, geocode, idUsuario=null){
  const departamento = await getDepartamentoById(idDepartamento);
  if(!departamento) return null;

  const editor = await getUsuarioById(idUsuario);

  departamento.nombre = nombre;
  departamento.geocode = geocode;
  departamento.ultimaEdicion = new Date();
  departamento.editor = editor;

  return departamento.save();
}

export async function deleteDepartamento(ideDepartamento){
  const departamento = await getDepartamentoById(ideDepartamento);
  if(!departamento) return null;

  return departamento.delete();
}