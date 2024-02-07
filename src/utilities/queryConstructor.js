import mongoose from "mongoose"

export const getFilter = ({filterParams, reviews=false, deleteds=false}) => {

  let filter = {}
  if(reviews){
    filter = {estado: { $in: ['En revisión', 'Validado', 'Rechazado']}}
  }
  else if(deleteds){
    filter = {estado: { $in: ['Publicado', 'Eliminado']}}
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
  return filter;
}

export const getSorting = ({sort=null, defaultSort, reviews=false}) => {
  //Sorting
  let sortQuery = {}
  if(sort && sort.field && sort.sort){
    sortQuery[sort.field] = sort.sort === 'desc' ? -1 : 1
    return sortQuery;
  }

  if(reviews){
    return { fechaEdicion: -1 }
  }

  return defaultSort;
}