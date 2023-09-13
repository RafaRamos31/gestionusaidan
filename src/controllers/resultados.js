import Resultado from "../models/resultados.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getAllResultados(){
  return Resultado.find();
}

export async function getResultadoById(idResultado){
  try {
    const resultado = await Resultado.findById(idResultado);
    return resultado;
  } catch (error) {
    throw error;
  }
}

export async function createResultado(codigo, nombre, fechaInicio, fechaFinal, idUsuario=null){
  const editor = await getUsuarioById(idUsuario);

  const resultado = new Resultado({
    codigo,
    nombre,
    fechaInicio,
    fechaFinal,
    ultimaEdicion: new Date(),
    editor
  })

  return resultado.save();
}

export async function editResultado(idResultado, codigo, nombre, fechaInicio, fechaFinal, idUsuario=null){
  const resultado = await getResultadoById(idResultado);
  if(!resultado) return null;

  const editor = await getUsuarioById(idUsuario);

  resultado.codigo = codigo;
  resultado.nombre = nombre;
  resultado.fechaInicio = fechaInicio;
  resultado.fechaFinal = fechaFinal;
  resultado.ultimaEdicion = new Date();
  resultado.editor = editor;

  return resultado.save();
}

export async function deleteResultado(idResultado){
  const resultado = await getResultadoById(idResultado);
  if(!resultado) return null;

  return resultado.delete();
}