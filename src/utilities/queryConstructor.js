import mongoose from "mongoose"

export const getFilter = ({filterParams, reviews=false, deleteds=false, eventComponente=null, eventCrear=false, eventCrearMEL=false, eventTerminar=false, eventDigitar=false, eventPresupuestar=false, eventConsolidar=false}) => {

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
  else if(eventCrearMEL){
    filter = {estadoPlanificacionMEL: { $in: ['Pendiente', 'Rechazado', 'Aprobado']}}
  }
  else if(eventTerminar){
    filter = {estadoRealizacion: { $in: ['En Ejecución', 'Finalizado', 'Rechazado']}}
  }
  else if(eventDigitar){
    filter = {estadoDigitacion: { $in: ['Pendiente', 'Digitando', 'Digitalizado', 'Rechazado']}}
  }
  else if(eventPresupuestar){
    filter = {estadoPresupuesto: { $in: ['Pendiente', 'Presupuestado']}}
  }
  else if(eventConsolidar){
    filter = {estadoConsolidado: { $in: ['Pendiente', 'Consolidado']}}
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

  if(eventCrear){
    return { estadoPlanificacionComponente: -1 }
  }

  if(eventCrearMEL){
    return { estadoPlanificacionMEL: -1 }
  }

  if(eventTerminar){
    return { estadoRealizacion: -1 }
  }

  if(eventDigitar){
    return { estadoDigitacion: -1 }
  }

  if(eventPresupuestar){
    return { estadoPresupuesto: -1 }
  }

  if(eventConsolidar){
    return { estadoConsolidado: -1 }
  }

  return defaultSort;
}