
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
    if(filterParams.operator === 'in'){
      filter[filterParams.field] = { $regex: new RegExp(filterParams.value, 'i')}
    }
  }
  return filter;
}

export const getSorting = ({sort, defaultSort, reviews=false}) => {
  //Sorting
  let sortQuery = {}
  if(sort.field && sort.value){
    sortQuery[sort.field] = sort.sort === 'desc' ? -1 : 1
    return sortQuery;
  }

  if(reviews){
    return { fechaEdicion: -1 }
  }

  return defaultSort;
}