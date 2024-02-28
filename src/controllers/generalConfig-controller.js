import GeneralConfig from "../models/generalConfig.js";

//Create internal
async function createConfig(){
  try {
    const config = new GeneralConfig({
      ref: 1,
      currentYear: null,
      enableSubirPlanificacion: false
    })

    return config.save();
  } catch (error) {
    throw error;
  }
}

//Get config
export async function getGeneralConfig(){
  try {
    let config = await GeneralConfig.findOne({ref: 1});
    if(!config){
      config = await createConfig();
    }
    return config;
  } catch (error) {
    throw error;
  }
}

//Edit config
export async function editConfig({
  response,
  idCurrentYear,
  enableSubirPlanificacion
}
){
  try {
    let config = await getGeneralConfig();

    config.currentYear = idCurrentYear || null;
    config.enableSubirPlanificacion = enableSubirPlanificacion;

    await config.save();
    response.json(config);
    return response;

  } catch (error) {
    throw error;
  }
}

