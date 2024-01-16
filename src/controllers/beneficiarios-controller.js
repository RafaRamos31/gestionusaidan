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

    const conteoPorEdadSexo = await getStatsEdad(filter);
    const conteoPorCargo = await getStatsCargo(filter);

    return {
      sexo: conteoPorEdadSexo,
      cargo: conteoPorCargo
    };
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
            sexo: '$sexo',
            edad: {
              $subtract: [
                { $year: new Date() },
                { $year: "$fecha" }
              ]
            },
          },
          count: { $sum: 1 }
        }
      }
    ]).exec();

    let format = [
      {
        name: '0-9',
        m: 0,
        f: 0
      },
      {
        name: '10-19',
        m: 0,
        f: 0
      },
      {
        name: '20-29',
        m: 0,
        f: 0
      },
      {
        name: '30-39',
        m: 0,
        f: 0
      },
      {
        name: '40-49',
        m: 0,
        f: 0
      },
      {
        name: '50-59',
        m: 0,
        f: 0
      },
      {
        name: '60+',
        m: 0,
        f: 0
      },
    ]
    
    const formmated = stats.reduce((acum, item) => {
      if(item._id.edad <=9){
        item._id.sexo === 1 ? acum[0].m = acum[0].m + 1 : acum[0].f = acum[0].f + 1
        return acum;
      }
      if(item._id.edad >=10 && item._id.edad <=19){
        item._id.sexo === 1 ? acum[1].m = acum[1].m + 1 : acum[1].f = acum[1].f + 1
        return acum;
      }
      if(item._id.edad >=20 && item._id.edad <=29){
        item._id.sexo === 1 ? acum[2].m = acum[2].m + 1 : acum[2].f = acum[2].f + 1
        return acum;
      }
      if(item._id.edad >=30 && item._id.edad <=39){
        item._id.sexo === 1 ? acum[3].m = acum[3].m + 1 : acum[3].f = acum[3].f + 1
        return acum;
      }
      if(item._id.edad >=40 && item._id.edad <=49){
        item._id.sexo === 1 ? acum[4].m = acum[4].m + 1 : acum[4].f = acum[4].f + 1
        return acum;
      }
      if(item._id.edad >=50 && item._id.edad <=59){
        item._id.sexo === 1 ? acum[5].m = acum[5].m + 1 : acum[5].f = acum[5].f + 1
        return acum;
      }
      else{
        item._id.sexo === 1 ? acum[6].m = acum[6].m + 1 : acum[6].f = acum[6].f + 1
      }

      return acum;

    }, format)

    return formmated;

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
            organizacion: '$organizacion',
            cargo: '$cargo'
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