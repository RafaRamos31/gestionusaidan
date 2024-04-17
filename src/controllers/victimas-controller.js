import Victima from "../models/victimas.js";

//Get  List
export async function getVictimas({response}){
  try {
    const victimas = await Victima.find();

    response.json(victimas);
    return response;

  } catch (error) {
    throw error;
  }
}


//Crear
export async function createVictima(response, nombre){
  try {
    const victima = new Victima({
      //Propiedades de objeto
      nombre,
      estado: 'Seguro',
    })
    victima.save()
    response.json(victima);
    return response;
  } catch (error) {
    throw error;
  }
}

//Toggle
export async function toggleVictima(response, idVictima){
  try {

    const victima = await Victima.findById(idVictima);

    victima.estado = 'Vulnerado';
    victima.save();

    response.json(victima);
    return response;

  } catch (error) {
    throw error;
  }
}
