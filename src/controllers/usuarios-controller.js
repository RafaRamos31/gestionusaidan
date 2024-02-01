import { createHash } from 'crypto';
import Usuario from "../models/usuarios.js";
import { getCargoById } from "./cargos-controller.js";
import { getComponentById } from "./componentes-controller.js";
import { getOrganizacionById } from "./organizaciones-controller.js";
import { getRolById } from "./roles-controller.js";
import { getDepartamentoById } from './departamentos-controller.js';
import { getMunicipioByIdSimple } from './municipios-controller.js';
import { getAldeaByIdSimple } from './aldeas-controller.js';
import { getCaserioByIdSimple } from './caserios-controller.js';

export async function getUsuarios(organizacion=null, cargo=null, componente=null, rol=null){
  try {

    let filter = {}

    if(organizacion){
      filter = {...filter, organizacion: {_id: organizacion}}
    }

    if(cargo){
      filter = {...filter, cargo: {_id: cargo}}
    }

    if(componente){
      filter = {...filter, componente: {_id: componente}}
    }

    if(rol){
      filter = {...filter, rol: {_id: rol}}
    }

    const usuarios = await Usuario.find(filter, '_id nombre rol componente organizacion cargo telefono correo ultimaEdicion editor estado').populate(['organizacion', 
    'cargo', 'componente', 'rol']);
    return usuarios;
  } catch (error) {
    throw error;
  }
}

export async function getUsuarioById(idUsuario){
  try {
    if(idUsuario === null){
      return null;
    }
    const usuario = await Usuario.findById(idUsuario).populate(['organizacion', 
    'cargo', 'componente', 'rol']);
    return usuario;
  } catch (error) {
    throw error;
  }
}

export async function getUsuarioByIdSimple(idUsuario){
  try {
    if(idUsuario === null){
      return null;
    }
    const usuario = await Usuario.findById(idUsuario, 'nombre');
    return usuario;
  } catch (error) {
    throw error;
  }
}

export async function createUsuario(nombre, dni, sexo, fechaNacimiento, idDepartamento, idMunicipio,
  idAldea, idCaserio, telefono, idOrganizacion, idCargo, geolocacion, idComponente, correo, password, idUsuario=null){

  const promises = await Promise.all([
    getDepartamentoById(idDepartamento),
    getMunicipioByIdSimple(idMunicipio),
    getAldeaByIdSimple(idAldea),
    getCaserioByIdSimple(idCaserio),
    getOrganizacionById(idOrganizacion),
    getCargoById(idCargo),
    getComponentById(idComponente),
    getUsuarioById(idUsuario)
  ])

  const usuario = new Usuario({
    nombre,
    dni,
    sexo,
    fechaNacimiento,
    departamento: promises[0],
    municipio: promises[1],
    aldea: promises[2],
    caserio: promises[3],
    telefono,
    organizacion: promises[4],
    cargo: promises[5],
    geolocacion,
    componente: promises[6],
    correo,
    password: hashPassword(password),
    estado: 'Revision',
    rol: null,
    ultimaEdicion: new Date(),
    editor: promises[7]
  })

  return usuario.save();
}

export async function editUsuario(idUsuario, nombre, dni, sexo, fechaNacimiento, idDepartamento, idMunicipio,
  idAldea, idCaserio, telefono, idOrganizacion, idCargo, geolocacion, idComponente, idRol, idEditor=null){

  const usuario = await getUsuarioById(idUsuario);
  if(!usuario) return null;

  const promises = await Promise.all([
    getDepartamentoById(idDepartamento),
    getMunicipioByIdSimple(idMunicipio),
    getAldeaByIdSimple(idAldea),
    getCaserioByIdSimple(idCaserio),
    getOrganizacionById(idOrganizacion),
    getCargoById(idCargo),
    getComponentById(idComponente),
    getRolById(idRol),
    getUsuarioById(idEditor)
  ])

  usuario.nombre = nombre;
  usuario.dni = dni;
  usuario.sexo = sexo;
  usuario.fechaNacimiento = fechaNacimiento;
  usuario.departamento = promises[0];
  usuario.municipio = promises[1];
  usuario.aldea = promises[2];
  usuario.caserio = promises[3];
  usuario.telefono = telefono;
  usuario.organizacion = promises[4];
  usuario.cargo = promises[5];
  usuario.componente = promises[6];
  usuario.rol = promises[7];
  usuario.geolocacion = geolocacion;
  usuario.ultimaEdicion = new Date();
  usuario.editor = promises[8];

  return usuario.save();
}

export async function deleteUsuario(idUsuario){
  const usuario = await getUsuarioById(idUsuario);
  if(!usuario) return null;

  return usuario.delete();
}


function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

//Login y Registro
export async function loginUser(email, password){
  try{
    const usuario = await Usuario.findOne({correo: email, password: hashPassword(password)}).populate('rol');
    return usuario;
  } catch (error) {
    throw error;
  }
}
