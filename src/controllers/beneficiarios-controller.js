import Beneficiario from "../models/beneficiarios.js";
import { getAldeaByIdSimple } from "./aldeas-controller.js";
import { getCargoById } from "./cargos-controller.js";
import { getCaserioByIdSimple } from "./caserios-controller.js";
import { getDepartamentoById } from "./departamentos-controller.js";
import { getMunicipioByIdSimple } from "./municipios-controller.js";
import { getOrganizacionById } from "./organizaciones-controller.js";
import { getUsuarioById } from "./usuarios-controller.js";

export async function getBeneficiarioById(idBeneficiario){
  try {
    const beneficiario = await Beneficiario.findById(idBeneficiario).populate(['organizacion', 'cargo', 
    'departamento', 'municipio', 'aldea', 'caserio']);
    return beneficiario;
  } catch (error) {
    throw error;
  }
}

export async function getBeneficiarios(departamento=null, municipio=null, aldea=null, caserio=null, organizacion=null, cargo=null){
  try {

    let filter = {}

    if(departamento){
      filter = {...filter, departamento: {_id: departamento}}
    }

    if(municipio){
      filter = {...filter, municipio: {_id: municipio}}
    }

    if(aldea){
      filter = {...filter, aldea: {_id: aldea}}
    }

    if(caserio){
      filter = {...filter, caserio: {_id: caserio}}
    }

    if(organizacion){
      filter = {...filter, organizacion: {_id: organizacion}}
    }

    if(cargo){
      filter = {...filter, cargo: {_id: cargo}}
    }

    const beneficiarios = await Beneficiario.find(filter).populate(['organizacion', 'cargo', 
    'departamento', 'municipio', 'aldea', 'caserio']);
    return beneficiarios;
  } catch (error) {
    throw error;
  }
}

export async function createBeneficiario(dni, nombre, sexo, fechaNacimiento, idDepartamento, idMunicipio,
  idAldea, idCaserio, telefono, idOrganizacion, idCargo, geolocacion, idUsuario=null){

  const promises = await Promise.all([
    getDepartamentoById(idDepartamento),
    getMunicipioByIdSimple(idMunicipio),
    getAldeaByIdSimple(idAldea),
    getCaserioByIdSimple(idCaserio),
    getOrganizacionById(idOrganizacion),
    getCargoById(idCargo),
    getUsuarioById(idUsuario)
  ])

  const beneficiario = new Beneficiario({
    dni,
    nombre,
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
    ultimaEdicion: new Date(),
    editor: promises[6]
  })

  return beneficiario.save();
}


export async function editBeneficiario(idBeneficiario, dni, nombre, sexo, fechaNacimiento, idDepartamento, idMunicipio,
  idAldea, idCaserio, telefono, idOrganizacion, idCargo, geolocacion, idUsuario=null){

  const beneficiario = await getBeneficiarioById(idBeneficiario);
  if(!beneficiario) return null;

  const promises = await Promise.all([
    getDepartamentoById(idDepartamento),
    getMunicipioByIdSimple(idMunicipio),
    getAldeaByIdSimple(idAldea),
    getCaserioByIdSimple(idCaserio),
    getOrganizacionById(idOrganizacion),
    getCargoById(idCargo),
    getUsuarioById(idUsuario)
  ])

  beneficiario.dni = dni;
  beneficiario.nombre = nombre;
  beneficiario.sexo = sexo;
  beneficiario.fechaNacimiento = fechaNacimiento;
  beneficiario.departamento = promises[0];
  beneficiario.municipio = promises[1];
  beneficiario.aldea = promises[2];
  beneficiario.caserio = promises[3];
  beneficiario.telefono = telefono;
  beneficiario.organizacion = promises[4];
  beneficiario.cargo = promises[5];
  beneficiario.geolocacion = geolocacion;
  beneficiario.ultimaEdicion = new Date();
  beneficiario.editor = promises[6];

  return beneficiario.save();
}

export async function deleteBeneficiario(idBeneficiario){
  const beneficiario = await getBeneficiarioById(idBeneficiario);
  if(!beneficiario) return null;

  return beneficiario.delete();
}


export async function getStatsBeneficiarios(departamento=null, municipio=null, aldea=null, caserio=null, organizacion=null, cargo=null){
  try {

    let filter = {}

    if(departamento){
      filter = {...filter, departamento: {_id: departamento}}
    }

    if(municipio){
      filter = {...filter, municipio: {_id: municipio}}
    }

    if(aldea){
      filter = {...filter, aldea: {_id: aldea}}
    }

    if(caserio){
      filter = {...filter, caserio: {_id: caserio}}
    }

    if(organizacion){
      filter = {...filter, organizacion: {_id: organizacion}}
    }

    if(cargo){
      filter = {...filter, cargo: {_id: cargo}}
    }

    const conteoPorSexo = await getStatsSexo(filter);
    const conteoPorEdad = await getStatsEdad(filter);
    const conteoPorCargo = await getStatsCargo(filter);

    return {
      sexo: conteoPorSexo,
      edad: conteoPorEdad,
      cargo: conteoPorCargo
    };
  } catch (error) {
    throw error;
  }
}

async function getStatsSexo(filter){
  try {

    const stats = await Beneficiario.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: "$sexo",
          count: { $sum: 1 }
        }
      }
    ]).exec();

    return stats;

  } catch (error) {
    throw error;
  }
}

async function getStatsEdad(filter){
  try {

    const stats = await Beneficiario.aggregate([
      {
        $match: filter
      },
      {
        $addFields: {
          fecha: {
            $toDate: "$fechaNacimiento"
          }
        }
      },
      {
        $group: {
          _id: {
            $subtract: [
              { $year: new Date() },
              { $year: "$fecha" }
            ]
          },
          count: { $sum: 1 }
        }
      },
      {
        $bucket: {
          groupBy: "$_id",
          boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
          default: "Otros",
          output: {
            count: { $sum: "$count" }
          }
        }
      }
    ]).exec();

    return stats;

  } catch (error) {
    throw error;
  }
}

async function getStatsCargo(filter){
  try {

    const stats = await Beneficiario.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: {
            Organizacion: '$organizacion',
            Cargo: '$cargo'
          },
          count: { $sum: 1 }
        }
      }
    ]).exec();

    return stats;

  } catch (error) {
    throw error;
  }
}