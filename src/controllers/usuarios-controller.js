import { createHash } from 'crypto';
import Usuario from "../models/usuarios.js";
import { getCargoById } from "./cargos-controller.js";
import { getComponentById } from "./componentes-controller.js";
import { getOrganizacionById } from "./organizaciones-controller.js";
import { getRolById } from "./roles-controller.js";

export async function getUsuarios(organizacion=null, cargo=null, componente=null, rol=null){
  try {

    let filter = {}

    if(organizacion){
      filter = {...filter, organizacion: {_id: organizacion}}
    }

    if(cargo){
      filter = {...filter, cargo: cargo}
    }

    if(componente){
      filter = {...filter, componente: {_id: componente}}
    }

    if(rol){
      filter = {...filter, rol: {_id: rol}}
    }

    const usuarios = await Usuario.find(filter, '-password').populate(['organizacion', 
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
    const usuario = await Usuario.findById(idUsuario, '-password').populate(['organizacion', 
    'cargo', 'componente', 'rol']);
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

export async function editUsuario(idUsuario, nombre, sexo, idOrganizacion, idCargo, idComponente, idRol,
  correo, idEditor=null){

  const usuario = await getUsuarioById(idUsuario);
  if(!usuario) return null;

  const promises = await Promise.all([
    getOrganizacionById(idOrganizacion),
    getCargoById(idCargo),
    getComponentById(idComponente),
    getRolById(idRol),
    getUsuarioById(idEditor)
  ])

  usuario.nombre = nombre;
  usuario.sexo = sexo;
  usuario.organizacion = promises[0];
  usuario.cargo = promises[1];
  usuario.componente = promises[2];
  usuario.rol = promises[3];
  usuario.correo = correo;
  usuario.ultimaEdicion = new Date();
  usuario.editor = promises[4];

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
    const usuario = await Usuario.findOne({correo: email, password: hashPassword(password)});
    return usuario;
  } catch (error) {
    throw error;
  }
}
