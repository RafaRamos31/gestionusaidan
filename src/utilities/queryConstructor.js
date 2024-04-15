import mongoose from "mongoose"

export const getFilter = ({filterParams, reviews=false, deleteds=false, eventComponente=null, eventKanban=false, eventCrear=false, eventCrearMEL=false, eventTerminar=false, eventDigitar=false, eventPresupuestar=false, eventConsolidar=false}) => {

  let filter = {}
  if(reviews){
    filter = {estado: { $in: ['En revisión', 'Validado', 'Rechazado']}}
  }
  else if(deleteds){
    filter = {estado: { $in: ['Publicado', 'Eliminado']}}
  }
  else if(eventCrear){
    filter = {estadoPlanificacionComponente: { $in: ['Pendiente', 'Rechazado', 'Aprobado']}}
  }
  else if(eventKanban){
    filter = {estadoRealizacion: { $in: ['Pendiente', 'En Ejecución', 'Finalizado']}}
  }
  else if(eventCrearMEL){
    filter = {estadoPlanificacionMEL: { $in: ['Pendiente', 'Rechazado', 'Aprobado']}}
  }
  else if(eventTerminar){
    filter = {estadoRealizacion: { $in: ['En Ejecución', 'Finalizado', 'Rechazado']}}
  }
  else if(eventDigitar){
    filter = {estadoDigitacion: { $in: ['Pendiente', 'En Curso', 'Finalizado']}}
  }
  else if(eventPresupuestar){
    filter = {estadoPresupuesto: { $in: ['Pendiente', 'Finalizado']}}
  }
  else if(eventConsolidar){
    filter = {estadoConsolidado: { $in: ['Incompleto', 'Pendiente', 'Finalizado']}}
  }
  else{
    filter = {estado: { $in: ['Publicado']}}
  }

  if(filterParams.value){
    if(filterParams.operator === 'contains'){
      filter[filterParams.field] = { $regex: new RegExp(filterParams.value, 'i')}
    }
    if(filterParams.operator === 'is'){
      filter[filterParams.field] = filterParams.value;
    }
    if(filterParams.operator === 'equals'){
      try {
        const objectId = mongoose.Types.ObjectId(filterParams.value);
        filter[filterParams.field] = objectId;
      } catch (error) {
        return filter;
      }
    }
  }

  if(eventComponente){
    filter = {...filter, componentes: eventComponente}
  }

  return filter;
}

export const getSorting = ({sort=null, defaultSort, reviews=false, eventCrear=false, eventCrearMEL=false, eventTerminar=false, eventDigitar=false, eventPresupuestar=false, eventConsolidar=false}) => {
  //Sorting
  let sortQuery = {}
  if(sort && sort.field && sort.sort){
    sortQuery[sort.field] = sort.sort === 'desc' ? -1 : 1
    return sortQuery;
  }

  if(reviews){
    return { fechaEdicion: -1 }
  }

  if(eventCrear || eventCrearMEL || eventTerminar || eventDigitar || eventPresupuestar || eventConsolidar){
    return { fechaCreacion: -1 }
  }

  return defaultSort;
}