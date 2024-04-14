import moment from "moment-timezone";
import Evento from "../models/eventos.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetTareaById } from "./tareas-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";


//Get internal
export async function privateGetEventoById(idEvento){
  try {
    return Evento.findById(idEvento);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountEventos({header, response, filterParams, 
  reviews=false, 
  deleteds=false, 
  eventComponente=null,
  eventCrear=false, 
  eventCrearMEL=false, 
  eventTerminar=false, 
  eventDigitar=false, 
  eventPresupuestar=false, 
  eventConsolidar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener los eventos. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Tareas'] === false){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tareas']['Ver Eliminados'] === false){
      deleteds = false;
    }*/

    const filter = getFilter({filterParams, reviews, deleteds, eventComponente, eventCrear, eventCrearMEL, eventTerminar, eventDigitar, eventPresupuestar, eventConsolidar})

    const count = await Evento.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}



//Get Info Paged
export async function getPagedEventos({header, response, page, pageSize, sort, filter,
  reviews=false, 
  deleteds=false,
  eventComponente=null,
  eventCrear=false, 
  eventCrearMEL=false, 
  eventTerminar=false, 
  eventDigitar=false, 
  eventPresupuestar=false, 
  eventConsolidar=false
}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Eventos. ' + auth.payload });

    //Validaciones de rol
    /* const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Indicadores']['Trimestres'] === false){
      return response.status(401).json({ error: 'Error al obtener Trimestres. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Trimestres']['Ver Eliminados'] === false){
      deleteds = false;
    }*/

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { estadoPlanificacionComponente: 1 }, eventCrear, eventCrearMEL, eventTerminar, eventDigitar, eventPresupuestar, eventConsolidar})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds, eventComponente, eventCrear, eventCrearMEL, eventTerminar, eventDigitar, eventPresupuestar, eventConsolidar})

    let populateQuery = [{
      path: 'organizador responsableCreacion revisorPlanificacionMEL revisorPlanificacionComponente',
      select: '_id nombre',
    },
    {
      path: 'tarea areaTematica componentes',
      select: '_id nombre titulo descripcion',
    }]

    if(eventTerminar){
      populateQuery = [{
        path: 'organizador responsableCreacion responsableFinalizacion revisorFinalizacion',
        select: '_id nombre',
      }]
    }

    if(eventDigitar){
      populateQuery = [{
        path: 'organizador responsableCreacion responsableDigitacion revisorDigitacion',
        select: '_id nombre',
      }]
    }

    if(eventPresupuestar){
      populateQuery = [{
        path: 'organizador responsableCreacion responsablePresupuesto',
        select: '_id nombre',
      }]
    }

    if(eventConsolidar){
      populateQuery = [{
        path: 'organizador responsableCreacion revisorDigitacion responsablePresupuesto',
        select: '_id nombre',
      }]
    }

    const eventos = await Evento.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate(populateQuery);

    response.json(eventos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Kanban
export async function getKanbanEventos({header, response, filter=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Eventos. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Planificación']['Tareas'] === false){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Tareas']['Ver Eliminados'] === false){
      deleteds = false;
    }*/

    //Filter
    const filterQuery = {estadoRealizacion: { $in: ['Pendiente', 'Cancelado', 'En Ejecución', 'Finalizado', 'Rechazado']}}

    const eventos = await Evento.find(filterQuery).populate([
    {
      path: 'organizador colaboradores',
      select: '_id nombre',
    },
    {
      path: 'tarea areaTematica componentes',
      select: '_id nombre titulo descripcion',
    }
  ]);

    response.json(eventos);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual crear
export async function getEventoByIdCrear(header, response, idEvento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener el Evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Tareas'] === false && rol.permisos.acciones['Tareas']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await Evento.findById(idEvento).populate([{
      path: 'organizador colaboradores departamento municipio aldea caserio responsableCreacion revisorPlanificacionMEL revisorPlanificacionComponente',
      select: '_id nombre',
    },
    {
      path: 'tarea areaTematica componentes componenteEncargado',
      select: '_id nombre titulo descripcion',
    },
  ]);

    response.json(evento);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual terminar
export async function getEventoByIdTerminar(header, response, idEvento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener el Evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Tareas'] === false && rol.permisos.acciones['Tareas']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await Evento.findById(idEvento).populate([{
      path: 'sectores tipoEvento responsableCreacion responsableFinalizacion revisorFinalizacion',
      select: '_id nombre',
    },
  ]);

    response.json(evento);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get individual presupuesto
export async function getEventoByIdTPresupuesto(header, response, idEvento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener el Evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Tareas'] === false && rol.permisos.acciones['Tareas']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await Evento.findById(idEvento).populate([{
      path: 'sectores responsableCreacion responsablePresupuesto',
      select: '_id nombre',
    },
  ]);

    response.json(evento);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get individual participantes
export async function getEventoByIdParticipantes(header, response, idEvento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener el Evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Planificación']['Tareas'] === false && rol.permisos.acciones['Tareas']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Tareas. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await Evento.findById(idEvento).populate([{
      path: 'sectores responsableCreacion responsableDigitacion revisorDigitacion responsableConsolidado',
      select: '_id nombre',
    },
    {
      path: 'areaTematica',
      select: '_id nombre descripcion indicadores',
      populate: {
        path: 'indicadores',
        select: '_id nombre descripcion'
      }
    },
    {
      path: 'participantes',
      select: '_id nombre sexo fechaNacimiento dni sector tipoOrganizacion organizacion cargo departamento municipio aldea caserio telefono',
      populate: {
        path: 'sector tipoOrganizacion organizacion cargo departamento municipio aldea caserio',
        select: '_id nombre'
      }
    },
  ]);

    response.json(evento);
    return response;

  } catch (error) {
    throw error;
  }
}


//Crear evento
export async function crearEvento({header, response, idTarea, nombre, idAreaTematica,  baseFechaInicio, baseFechaFinal, timezone, idDepartamento, idMunicipio, 
  idAldea, idCaserio, idOrganizador, componentes, colaboradores, aprobarComponente=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const fechaInicioQuarter = moment(baseFechaInicio)
    const fechaFinalQuarter = moment(baseFechaFinal)
    const tarea = await privateGetTareaById(idTarea)

    const evento = new Evento({
      tarea: tarea,
      componenteEncargado: tarea.componente,
      nombre,
      areaTematica: idAreaTematica,
      fechaInicio: fechaInicioQuarter,
      fechaFinal: fechaFinalQuarter,
      departamento: idDepartamento,
      municipio: idMunicipio,
      aldea: idAldea,
      caserio: idCaserio,
      organizador: idOrganizador,
      componentes,
      colaboradores,
      fechaCreacion: new Date(),
      responsableCreacion: auth.payload.userId,
      estadoPlanificacionComponente: aprobarComponente ? 'Aprobado' : 'Pendiente',
      fechaRevisionComponente: aprobarComponente ? new Date() : null,
      revisorPlanificacionComponente: aprobarComponente ? auth.payload.userId : null,
      estadoPlanificacionMEL: 'Pendiente',
      estadoRealizacion: 'Pendiente'
    })

    await evento.save();

    response.json(evento);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editEventoCrear({header, response, idEvento, idTarea, nombre, idAreaTematica,  baseFechaInicio, baseFechaFinal, timezone, idDepartamento, idMunicipio, 
  idAldea, idCaserio, idOrganizador, componentes, colaboradores, aprobarComponente=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al modificar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return response.status(404).json({ error: 'Error al modificar el evento. Evento no encontrado.' });

    const fechaInicioQuarter = moment(baseFechaInicio)
    const fechaFinalQuarter = moment(baseFechaFinal)
    const tarea = await privateGetTareaById(idTarea)

    evento.tarea = tarea;
    evento.componenteEncargado = tarea.componente;
    evento.nombre = nombre;
    evento.areaTematica = idAreaTematica;
    evento.fechaInicio = fechaInicioQuarter;
    evento.fechaFinal = fechaFinalQuarter;
    evento.departamento = idDepartamento;
    evento.municipio = idMunicipio;
    evento.aldea = idAldea;
    evento.caserio = idCaserio;
    evento.organizador = idOrganizador;
    evento.componentes = componentes;
    evento.colaboradores = colaboradores;
    evento.estadoPlanificacionComponente = aprobarComponente ? 'Aprobado' : 'Pendiente';
    evento.fechaRevisionComponente = aprobarComponente ? new Date() : null;
    evento.observacionesPlanificacionComponente = '';
    evento.revisorPlanificacionComponente = aprobarComponente ? auth.payload.userId : null;
    evento.estadoPlanificacionMEL = 'Pendiente';
    evento.fechaRevisionMEL = null;
    evento.revisorPlanificacionMEL = null;
    evento.observacionesPlanificacionMEL = '';
    evento.estadoRealizacion = 'Pendiente';

    await evento.save();

    response.json(evento);
    return response;
  } catch (error) {
    throw error;
  }
}


//Review Creacion componente
export async function revisarEventoCreacionComp(header, response, idEvento, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return response.status(404).json({ error: 'Error al revisar el evento. Evento no encontrado.' });

    evento.estadoPlanificacionComponente = aprobado
    evento.observacionesPlanificacionComponente = observaciones;
    evento.fechaRevisionComponente = new Date();
    evento.revisorPlanificacionComponente = auth.payload.userId;

    if(evento.estadoPlanificacionComponente === 'Aprobado' && evento.estadoPlanificacionMEL === 'Aprobado'){
      evento.estadoRealizacion = 'En Ejecución'
    }
    
    await evento.save();

    response.json(evento);
    return response;
    
  } catch (error) {
    throw error;
  }
}

//Review Creacion MEL
export async function revisarEventoCreacionMEL(header, response, idEvento, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return response.status(404).json({ error: 'Error al revisar el evento. Evento no encontrado.' });

    evento.estadoPlanificacionMEL = aprobado
    evento.observacionesPlanificacionMEL = observaciones;
    evento.fechaRevisionMEL = new Date();
    evento.revisorPlanificacionMEL = auth.payload.userId;

    if(evento.estadoPlanificacionComponente === 'Aprobado' && evento.estadoPlanificacionMEL === 'Aprobado'){
      evento.estadoRealizacion = 'En Ejecución'
    }
    
    await evento.save();

    response.json(evento);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Crear evento finalizado
export async function crearEventoFinalizar({header, response, idEvento, numeroFormulario, participantesHombres, participantesMujeres, participantesComunitarios, participantesInstitucionales, 
  totalDias, totalHoras, idTipoEvento, sectores, niveles, logros, compromisos, enlaceFormulario, enlaceFotografias, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al finalizar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return response.status(404).json({ error: 'Error al finalizar el evento. Evento no encontrado.' });

    evento.numeroFormulario = numeroFormulario;
    evento.participantesHombres = participantesHombres;
    evento.participantesMujeres = participantesMujeres;
    evento.participantesComunitarios = participantesComunitarios;
    evento.participantesInstitucionales = participantesInstitucionales;
    evento.totalDias = totalDias;
    evento.totalHoras = totalHoras;
    evento.tipoEvento = idTipoEvento;
    evento.sectores = sectores;
    evento.niveles = niveles;
    evento.logros = logros;
    evento.compromisos = compromisos;
    evento.enlaceFormulario = enlaceFormulario;
    evento.enlaceFotografias = enlaceFotografias;
    evento.estadoRealizacion = 'Finalizado';
    evento.fechaFinalizacionEvento = new Date();
    evento.responsableFinalizacion = auth.payload.userId;
    evento.revisorFinalizacion = aprobar ? auth.payload.userId : null;
    evento.estadoRevisionFinalizacion = aprobar ? 'Aprobado' : 'Pendiente';
    evento.fechaRevisionFinalizacion = aprobar ? new Date() : null;
    evento.observacionesFinalizacion = null;

    if(evento.estadoRevisionFinalizacion === 'Aprobado'){
      evento.estadoDigitacion = 'Pendiente'
      evento.estadoPresupuesto = 'Pendiente'
      evento.estadoConsolidado = 'Incompleto'
    }

    await evento.save();

    response.json(evento);
    return response;
  } catch (error) {
    throw error;
  }
}

//Review Finalizacion
export async function revisarEventoFinalizacion(header, response, idEvento, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return response.status(404).json({ error: 'Error al revisar el evento. Evento no encontrado.' });

    evento.estadoRevisionFinalizacion = aprobado
    evento.observacionesFinalizacion = observaciones;
    evento.fechaRevisionFinalizacion = new Date();
    evento.revisorFinalizacion = auth.payload.userId;

    if(evento.estadoRevisionFinalizacion === 'Aprobado'){
      evento.estadoDigitacion = 'Pendiente'
      evento.estadoPresupuesto = 'Pendiente'
      evento.estadoConsolidado = 'Incompleto'
    }
    
    await evento.save();

    response.json(evento);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Crear participantes evento
export async function crearParticipantesEvento({header, response, idEvento, registradosHombres, registradosMujeres, participantes}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento)

    evento.participantes = participantes;
    evento.registradosHombres = registradosHombres;
    evento.registradosMujeres = registradosMujeres;

    evento.responsableDigitacion = auth.payload.userId;
    evento.estadoDigitacion = 'Finalizado';
    evento.fechaDigitacion = new Date();

    evento.estadoRevisionDigitacion = 'Pendiente';
    evento.observacionesDigitacion = null;
    evento.fechaRevisionDigitacion = null;
    evento.revisorDigitacion = null;

    await evento.save();

    response.json(evento);
    return response;
  } catch (error) {
    throw error;
  }
}


//Review Digitacion
export async function revisarEventoDigitacion(header, response, idEvento, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return response.status(404).json({ error: 'Error al revisar el evento. Evento no encontrado.' });

    evento.estadoRevisionDigitacion = aprobado
    evento.observacionesDigitacion = observaciones;
    evento.fechaRevisionDigitacion = new Date();
    evento.revisorDigitacion = auth.payload.userId;

    if(evento.estadoRevisionDigitacion === 'Aprobado' && evento.estadoPresupuesto === 'Finalizado'){
      evento.estadoConsolidado = 'Pendiente'
    }
    
    await evento.save();

    response.json(evento);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Digitacion en curso
export async function toggleDigitandoEvento(header, response, idEvento){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Tareas']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return response.status(404).json({ error: 'Error al revisar el evento. Evento no encontrado.' });

    evento.estadoDigitacion = 'En Curso'
    evento.fechaDigitacion = new Date();
    evento.responsableDigitacion = auth.payload.userId;
    
    await evento.save();

    response.json(evento);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Crear presupuesto evento
export async function crearPresupuestoEvento({header, response, idEvento, totalPresupuesto, enlacePresupuesto}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al presupuestar el evento. ' + auth.payload });

    //Validaciones de rol
    /*const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear Tarea. No cuenta con los permisos suficientes.'});
    }*/

    const evento = await privateGetEventoById(idEvento)

    evento.totalPresupuesto = totalPresupuesto;
    evento.enlacePresupuesto = enlacePresupuesto;

    evento.responsablePresupuesto = auth.payload.userId;
    evento.estadoPresupuesto = 'Finalizado';
    evento.fechaPresupuesto = new Date();

    if(evento.estadoRevisionDigitacion === 'Aprobado' && evento.estadoPresupuesto === 'Finalizado'){
      evento.estadoConsolidado = 'Pendiente'
    }

    await evento.save();

    response.json(evento);
    return response;
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteTarea(header, response, idTarea, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar la tarea. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Tareas']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar Tarea. No cuenta con los permisos suficientes.'});
  }

  const tarea = await privateGetTareaById(idTarea);
  if(!tarea) return response.status(404).json({ error: 'Error al eliminar la tarea. Tarea no encontrada.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar la tarea. Usuario no encontrado.' });

  if(tarea.estado !== 'Eliminado'){
    tarea.estado = 'Eliminado'
    tarea.fechaEliminacion = new Date();
    tarea.eliminador = eliminador;
    tarea.observaciones = observaciones;
  }

  else{
    tarea.estado = 'Publicado'
    tarea.fechaEliminacion = null;
    tarea.eliminador = null;
    tarea.observaciones = null;
  }

  await tarea.save();

  response.json(tarea);
  return response;
}