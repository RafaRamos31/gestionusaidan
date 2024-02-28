import Indicador from "../models/indicadores.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetUsuarioById } from "./usuarios-controller.js";

const progresosModel = {
  'AF24': {
    'T1': {
      'OCT': 0,
      'NOV': 0,
      'DIC': 0,
      'Total': 0
    },
    'T2': {
      'ENE': 0,
      'FEB': 0,
      'MAR': 0,
      'Total': 0
    },
    'T3': {
      'ABR': 0,
      'MAY': 0,
      'JUN': 0,
      'Total': 0
    },
    'T4': {
      'JUL': 0,
      'AGO': 0,
      'SEP': 0,
      'Total': 0
    },
    'Total': {
      'Total': 0
    }
  },
  'AF25': {
    'T1': {
      'OCT': 0,
      'NOV': 0,
      'DIC': 0,
      'Total': 0
    },
    'T2': {
      'ENE': 0,
      'FEB': 0,
      'MAR': 0,
      'Total': 0
    },
    'T3': {
      'ABR': 0,
      'MAY': 0,
      'JUN': 0,
      'Total': 0
    },
    'T4': {
      'JUL': 0,
      'AGO': 0,
      'SEP': 0,
      'Total': 0
    },
    'Total': {
      'Total': 0
    }
  },
  'AF26': {
    'T1': {
      'OCT': 0,
      'NOV': 0,
      'DIC': 0,
      'Total': 0
    },
    'T2': {
      'ENE': 0,
      'FEB': 0,
      'MAR': 0,
      'Total': 0
    },
    'T3': {
      'ABR': 0,
      'MAY': 0,
      'JUN': 0,
      'Total': 0
    },
    'T4': {
      'JUL': 0,
      'AGO': 0,
      'SEP': 0,
      'Total': 0
    },
    'Total': {
      'Total': 0
    }
  },
  'AF27': {
    'T1': {
      'OCT': 0,
      'NOV': 0,
      'DIC': 0,
      'Total': 0
    },
    'T2': {
      'ENE': 0,
      'FEB': 0,
      'MAR': 0,
      'Total': 0
    },
    'T3': {
      'ABR': 0,
      'MAY': 0,
      'JUN': 0,
      'Total': 0
    },
    'T4': {
      'JUL': 0,
      'AGO': 0,
      'SEP': 0,
      'Total': 0
    },
    'Total': {
      'Total': 0
    }
  },
  'AF28': {
    'T1': {
      'OCT': 0,
      'NOV': 0,
      'DIC': 0,
      'Total': 0
    },
    'T2': {
      'ENE': 0,
      'FEB': 0,
      'MAR': 0,
      'Total': 0
    },
    'T3': {
      'ABR': 0,
      'MAY': 0,
      'JUN': 0,
      'Total': 0
    },
    'T4': {
      'JUL': 0,
      'AGO': 0,
      'SEP': 0,
      'Total': 0
    },
    'Total': {
      'Total': 0
    }
  },
  'LOP': {
    'T1': {
      'OCT': 0,
      'NOV': 0,
      'DIC': 0,
      'Total': 0
    },
    'T2': {
      'ENE': 0,
      'FEB': 0,
      'MAR': 0,
      'Total': 0
    },
    'T3': {
      'ABR': 0,
      'MAY': 0,
      'JUN': 0,
      'Total': 0
    },
    'T4': {
      'JUL': 0,
      'AGO': 0,
      'SEP': 0,
      'Total': 0
    },
    'Total': {
      'Total': 0
    }
  },
}

const addMonthsMetas = (metas) => {
  return {
    'AF24': {
      'T1': {
        'OCT': metas['AF24']['T1'],
        'NOV': metas['AF24']['T1'],
        'DIC': metas['AF24']['T1'],
        'Total': metas['AF24']['T1'],
      },
      'T2': {
        'ENE': metas['AF24']['T2'],
        'FEB': metas['AF24']['T2'],
        'MAR': metas['AF24']['T2'],
        'Total': metas['AF24']['T2'],
      },
      'T3': {
        'ABR': metas['AF24']['T3'],
        'MAY': metas['AF24']['T3'],
        'JUN': metas['AF24']['T3'],
        'Total': metas['AF24']['T3'],
      },
      'T4': {
        'JUL': metas['AF24']['T4'],
        'AGO': metas['AF24']['T4'],
        'SEP': metas['AF24']['T4'],
        'Total': metas['AF24']['T4'],
      },
      'Total': {
        'Total': metas['AF24']['Total']
      } 
    },
    'AF25': {
      'T1': {
        'OCT': metas['AF25']['T1'],
        'NOV': metas['AF25']['T1'],
        'DIC': metas['AF25']['T1'],
        'Total': metas['AF25']['T1'],
      },
      'T2': {
        'ENE': metas['AF25']['T2'],
        'FEB': metas['AF25']['T2'],
        'MAR': metas['AF25']['T2'],
        'Total': metas['AF25']['T2'],
      },
      'T3': {
        'ABR': metas['AF25']['T3'],
        'MAY': metas['AF25']['T3'],
        'JUN': metas['AF25']['T3'],
        'Total': metas['AF25']['T3'],
      },
      'T4': {
        'JUL': metas['AF25']['T4'],
        'AGO': metas['AF25']['T4'],
        'SEP': metas['AF25']['T4'],
        'Total': metas['AF25']['T4'],
      },
      'Total': {
        'Total': metas['AF25']['Total']
      } 
    },
    'AF26': {
      'T1': {
        'OCT': metas['AF26']['T1'],
        'NOV': metas['AF26']['T1'],
        'DIC': metas['AF26']['T1'],
        'Total': metas['AF26']['T1'],
      },
      'T2': {
        'ENE': metas['AF26']['T2'],
        'FEB': metas['AF26']['T2'],
        'MAR': metas['AF26']['T2'],
        'Total': metas['AF26']['T2'],
      },
      'T3': {
        'ABR': metas['AF26']['T3'],
        'MAY': metas['AF26']['T3'],
        'JUN': metas['AF26']['T3'],
        'Total': metas['AF26']['T3'],
      },
      'T4': {
        'JUL': metas['AF26']['T4'],
        'AGO': metas['AF26']['T4'],
        'SEP': metas['AF26']['T4'],
        'Total': metas['AF26']['T4'],
      },
      'Total': {
        'Total': metas['AF26']['Total']
      } 
    },
    'AF27': {
      'T1': {
        'OCT': metas['AF27']['T1'],
        'NOV': metas['AF27']['T1'],
        'DIC': metas['AF27']['T1'],
        'Total': metas['AF27']['T1'],
      },
      'T2': {
        'ENE': metas['AF27']['T2'],
        'FEB': metas['AF27']['T2'],
        'MAR': metas['AF27']['T2'],
        'Total': metas['AF27']['T2'],
      },
      'T3': {
        'ABR': metas['AF27']['T3'],
        'MAY': metas['AF27']['T3'],
        'JUN': metas['AF27']['T3'],
        'Total': metas['AF27']['T3'],
      },
      'T4': {
        'JUL': metas['AF27']['T4'],
        'AGO': metas['AF27']['T4'],
        'SEP': metas['AF27']['T4'],
        'Total': metas['AF27']['T4'],
      },
      'Total': {
        'Total': metas['AF27']['Total']
      } 
    },
    'AF28': {
      'T1': {
        'OCT': metas['AF28']['T1'],
        'NOV': metas['AF28']['T1'],
        'DIC': metas['AF28']['T1'],
        'Total': metas['AF28']['T1'],
      },
      'T2': {
        'ENE': metas['AF28']['T2'],
        'FEB': metas['AF28']['T2'],
        'MAR': metas['AF28']['T2'],
        'Total': metas['AF28']['T2'],
      },
      'T3': {
        'ABR': metas['AF28']['T3'],
        'MAY': metas['AF28']['T3'],
        'JUN': metas['AF28']['T3'],
        'Total': metas['AF28']['T3'],
      },
      'T4': {
        'JUL': metas['AF28']['T4'],
        'AGO': metas['AF28']['T4'],
        'SEP': metas['AF28']['T4'],
        'Total': metas['AF28']['T4'],
      },
      'Total': {
        'Total': metas['AF28']['Total']
      } 
    },
    'LOP': {
      'T1': {
        'OCT': metas['LOP']['T1'],
        'NOV': metas['LOP']['T1'],
        'DIC': metas['LOP']['T1'],
        'Total': metas['LOP']['T1'],
      },
      'T2': {
        'ENE': metas['LOP']['T2'],
        'FEB': metas['LOP']['T2'],
        'MAR': metas['LOP']['T2'],
        'Total': metas['LOP']['T2'],
      },
      'T3': {
        'ABR': metas['LOP']['T3'],
        'MAY': metas['LOP']['T3'],
        'JUN': metas['LOP']['T3'],
        'Total': metas['LOP']['T3'],
      },
      'T4': {
        'JUL': metas['LOP']['T4'],
        'AGO': metas['LOP']['T4'],
        'SEP': metas['LOP']['T4'],
        'Total': metas['LOP']['T4'],
      },
      'Total': {
        'Total': metas['LOP']['Total']
      } 
    }
  }
}

//Internos para validacion de claves unicas
async function validateUniquesIndicadores({id=null, nombre = null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Indicador.exists(filter);
}

//Get internal
export async function privateGetIndicadorById(idIndicador){
  try {
    return Indicador.findById(idIndicador);
  } catch (error) {
    throw error;
  }
}


//Get Count
export async function getCountIndicadores({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener indicadores. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Indicadores']['Indicadores'] === false){
      return response.status(401).json({ error: 'Error al obtener Indicadores. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Indicadores']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Indicador.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}

//Get Info Paged
export async function getPagedIndicadores({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Indicadores. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Indicadores']['Indicadores'] === false){
      return response.status(401).json({ error: 'Error al obtener Indicadores. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Indicadores']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const indicadores = await Indicador.find(filterQuery).sort(sortQuery).skip(skip).limit(pageSize).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }
  ]);

    response.json(indicadores);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListIndicadores({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener indicadores. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const indicadores = await Indicador.find(filterQuery, '_id nombre descripcion').sort(sortQuery);

    response.json(indicadores);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getIndicadorById(header, response, idIndicador){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener indicadores. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Indicadores']['Indicadores'] === false && rol.permisos.acciones['Indicadores']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Indicadores. No cuenta con los permisos suficientes.'});
    }

    const indicador = await Indicador.findById(idIndicador).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }
  ]);

    response.json(indicador);
    return response;

  } catch (error) {
    throw error;
  }
}

//Get revisiones subresultado
export async function getRevisionesIndicadores(header, response, idIndicador){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Indicador. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Indicadores']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Indicadores. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Indicador.find({original: {_id: idIndicador}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1}).populate([{
      path: 'editor revisor eliminador',
      select: '_id nombre',
    }
  ]);

    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear 
export async function createIndicador({header, response, nombre, descripcion, medida, tipoIndicador, frecuencia, metas, aprobar=false}){
  try {

    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear el indicador. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Indicadores']['Crear'] === false){
      return response.status(401).json({ error: 'Error al crear el Indicador. No cuenta con los permisos suficientes.'});
    }

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al crear el indicador. Usuario no encontrado.' });

    const existentNombre = await validateUniquesIndicadores({nombre})
    if(existentNombre) return response.status(400).json({ error: `Error al crear el indicador. El código ${nombre} ya está en uso.` });

    const baseIndicador = new Indicador({
      //Propiedades de objeto
      nombre,
      descripcion,
      medida,
      tipoIndicador,
      frecuencia,
      metas: addMonthsMetas(metas),
      progresos: progresosModel,
      //Propiedades de control
      original: null,
      version: '0.1',
      ultimaRevision: '0.1',
      estado: 'En revisión',
      fechaEdicion: new Date(),
      editor,
      fechaRevision: null,
      revisor: null,
      fechaEliminacion: null,
      eliminador: null,
      observaciones: null,
      pendientes: []
    })

    await baseIndicador.save();

    if(aprobar){
      const indicador = new Indicador({
        //Propiedades de objeto
        nombre,
        descripcion,
        medida,
        tipoIndicador,
        frecuencia,
        metas: addMonthsMetas(metas),
        progresos: progresosModel,
        //Propiedades de control
        original: null,
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        fechaEdicion: new Date(),
        editor,
        fechaRevision: new Date(),
        revisor: editor,
        fechaEliminacion: null,
        eliminador: null,
        observaciones: null,
        pendientes: []
      })
      
      baseIndicador.original = indicador._id;
      baseIndicador.estado = 'Validado';
      baseIndicador.fechaRevision = new Date();
      baseIndicador.revisor = editor;

      await baseIndicador.save();

      indicador.original = indicador._id;
      await indicador.save();
    }

    response.json(baseIndicador);
    return response;
  } catch (error) {
    throw error;
  }
}

//Edit info
export async function editIndicador({header, response, idIndicador, nombre, descripcion, medida, tipoIndicador, frecuencia, metas, aprobar=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar el indicador. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Indicadores']['Modificar'] === false){
      return response.status(401).json({ error: 'Error al editar el Indicador. No cuenta con los permisos suficientes.'});
    }

    const indicador = await privateGetIndicadorById(idIndicador);
    if(!indicador) return response.status(404).json({ error: 'Error al editar el indicador. Indicador no encontrado' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar el indicador. Usuario no encontrado' });

    const existentNombre = await validateUniquesIndicadores({nombre, id: idIndicador})
    if(existentNombre) return response.status(400).json({ error: `Error al editar el indicador. El código ${nombre} ya está en uso.` });

    //Crear objeto de actualizacion
    const updateIndicador = new Indicador({
      //Propiedades de objeto
      nombre,
      descripcion,
      medida,
      tipoIndicador,
      frecuencia,
      metas: addMonthsMetas(metas),
      progresos: progresosModel,
      //Propiedades de control
      original: indicador._id,
      version: updateVersion(indicador.ultimaRevision),
      estado: aprobar ? 'Validado' : 'En revisión',
      fechaEdicion: new Date(),
      editor: editor,
      fechaRevision: aprobar ? new Date() : null,
      revisor: aprobar ? editor : null,
      fechaEliminacion: null,
      eliminador: null,
      observaciones: null,
      pendientes: []
    })
  
    if(aprobar){
      //Actualizar objeto publico
      //Propiedades de objeto
      indicador.nombre = nombre;
      indicador.descripcion = descripcion;
      indicador.medida = medida
      indicador.tipoIndicador = tipoIndicador
      indicador.frecuencia = frecuencia
      indicador.metas = addMonthsMetas(metas)
      //Propiedades de control
      indicador.version = updateVersion(indicador.version, aprobar);
      indicador.ultimaRevision = indicador.version;
      indicador.fechaEdicion = new Date();
      indicador.editor = editor;
      indicador.fechaRevision = new Date();
      indicador.revisor = editor;
      indicador.observaciones = null;
    }
    else{
      indicador.pendientes = indicador.pendientes.concat(editor._id);
      indicador.ultimaRevision = updateVersion(indicador.ultimaRevision)
    }
  
    await updateIndicador.save();
    await indicador.save();

    response.json(updateIndicador);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review
export async function revisarUpdateIndicador(header, response, idIndicador, aprobado, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar el indicador. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetResultadoById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Indicadores']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar el Indicador. No cuenta con los permisos suficientes.'});
    }

    const updateIndicador = await privateGetIndicadorById(idIndicador);
    if(!updateIndicador) return response.status(404).json({ error: 'Error al revisar el indicador. Revisión no encontrada.' });

    const original = await privateGetIndicadorById(updateIndicador.original);
    if(!original && updateIndicador.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el indicador. Indicador no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el indicador. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateIndicador.estado = 'Validado'
      updateIndicador.fechaRevision = new Date();
      updateIndicador.revisor = revisor;
      updateIndicador.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateIndicador.nombre;
        original.descripcion = updateIndicador.descripcion;
        original.medida = updateIndicador.medida
        original.tipoIndicador = updateIndicador.tipoIndicador
        original.frecuencia = updateIndicador.frecuencia
        original.metas = updateIndicador.metas
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateIndicador.fechaEdicion;
        original.editor = updateIndicador.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const indicador = new Indicador({
          //Propiedades de objeto
          nombre: updateIndicador.nombre,
          descripcion: updateIndicador.descripcion,
          medida: updateIndicador.medida,
          tipoIndicador: updateIndicador.tipoIndicador,
          frecuencia: updateIndicador.frecuencia,
          metas: updateIndicador.metas,
          progresos: progresosModel,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateIndicador.fechaEdicion,
          editor: updateIndicador.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateIndicador.original = indicador._id;
  
        await updateIndicador.save();
  
        indicador.original = indicador._id;
        await indicador.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateIndicador.estado = 'Rechazado'
      updateIndicador.fechaRevision = new Date();
      updateIndicador.revisor = revisor;
      updateIndicador.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateIndicador.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateIndicador.save();

    response.json(updateIndicador);
    return response;
    
  } catch (error) {
    throw error;
  }
}


//Delete undelete
export async function deleteIndicador(header, response, idIndicador, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar el indicador. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Indicadores']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar el Indicador. No cuenta con los permisos suficientes.'});
  }

  const indicador = await privateGetIndicadorById(idIndicador);
  if(!indicador) return response.status(404).json({ error: 'Error al eliminar el indicador. Indicador no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el indicador. Usuario no encontrado.' });

  if(indicador.estado !== 'Eliminado'){
    indicador.estado = 'Eliminado'
    indicador.fechaEliminacion = new Date();
    indicador.eliminador = eliminador;
    indicador.observaciones = observaciones;
  }

  else{
    indicador.estado = 'Publicado'
    indicador.fechaEliminacion = null;
    indicador.eliminador = null;
    indicador.observaciones = null;
  }
  

  await indicador.save();

  response.json(indicador);
  return response;
}