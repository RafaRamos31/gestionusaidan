import Departamento from "../models/departamentos.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { getUsuarioById, getUsuarioByIdSimple } from "./usuarios-controller.js";

async function validateUniquesDepartamento({id=null, geocode = null}){
  let filter = {estado: 'Publicado'}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Departamento.exists(filter);
}

export async function getAllDepartamentos(){
  return Departamento.find({estado: 'Publicado'}).sort({ geocode: 1 });
}

export async function getDepartamentoById(idDepartamento){
  try {
    const departamento = await Departamento.findById(idDepartamento);
    return departamento;
  } catch (error) {
    throw error;
  }
}

export async function getAllRevisionesDepartamentos(){
  return Departamento.find({estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({ fechaEdicion: -1 });
}

export async function getRevisionesDepartamento(idDepartamento){
  try {
    return Departamento.find({original: {_id: idDepartamento}, estado: { $nin: ['Publicado', 'Eliminado'] }}).sort({version: -1});
  } catch (error) {
    throw error;
  }
}

export async function createDepartamento(response, nombre, geocode, idUsuario, aprobar=false){
  try {
    const editor = await getUsuarioByIdSimple(idUsuario);
    if(!editor) return response.status(404).json({ error: 'Error al crear el departamento. Usuario no encontrado' });

    const existentGeocode = await validateUniquesDepartamento({geocode})
    if(existentGeocode) return response.status(400).json({ error: `Error al crear el departamento. El geocode ${geocode} ya está en uso.` });

    const baseDepartamento = new Departamento({
      //Propiedades de objeto
      nombre,
      geocode,
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

    await baseDepartamento.save();

    if(aprobar){
      const departamento = new Departamento({
        //Propiedades de objeto
        nombre,
        geocode,
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
      
      baseDepartamento.original = departamento._id;
      baseDepartamento.estado = 'Validado';
      baseDepartamento.fechaRevision = new Date();
      baseDepartamento.revisor = editor;

      await baseDepartamento.save();

      departamento.original = departamento._id;
      await departamento.save();
    }

    response.json(baseDepartamento);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function editDepartamento(response, idDepartamento, nombre, geocode, idUsuario=null, aprobar=false){
  try {
    const departamento = await getDepartamentoById(idDepartamento);
    if(!departamento) return response.status(404).json({ error: 'Error al editar el departamento. Departamento no encontrado' });
  
    const editor = await getUsuarioByIdSimple(idUsuario);
    if(!editor) return response.status(404).json({ error: 'Error al editar el departamento. Usuario no encontrado' });
  
    const existentGeocode = await validateUniquesDepartamento({geocode, id: idDepartamento})
    if(existentGeocode) return response.status(400).json({ error: `Error al crear el departamento. El geocode ${geocode} ya está en uso.` });
  
    //Crear objeto de actualizacion
    const updateDepartamento = new Departamento({
      //Propiedades de objeto
      nombre,
      geocode,
      //Propiedades de control
      original: departamento._id,
      version: updateVersion(departamento.ultimaRevision),
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
      departamento.nombre = nombre;
      departamento.geocode = geocode;
      //Propiedades de control
      departamento.version = updateVersion(departamento.version, aprobar);
      departamento.ultimaRevision = departamento.version;
      departamento.fechaEdicion = new Date();
      departamento.editor = editor;
      departamento.fechaRevision = new Date();
      departamento.revisor = editor;
      departamento.observaciones = null;
    }
    else{
      departamento.pendientes = departamento.pendientes.concat(editor._id);
      departamento.ultimaRevision = updateVersion(departamento.ultimaRevision)
    }
  
    await updateDepartamento.save();
    await departamento.save();

    response.json(updateDepartamento);
    return response;

  } catch (error) {
    throw error;
  }
}

export async function revisarUpdateDepartamento(response, idDepartamento, idRevisor, aprobado, observaciones){
  try {
    const updateDepartamento = await getDepartamentoById(idDepartamento);
    if(!updateDepartamento) return response.status(404).json({ error: 'Error al revisar el departamento. Revisión no encontrada.' });

    const original = await getDepartamentoById(updateDepartamento.original);
    if(!original && updateDepartamento.version !== '0.1') return response.status(404).json({ error: 'Error al revisar el departamento. Departamento no encontrado.' });

    const revisor = await getUsuarioByIdSimple(idRevisor);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar el departamento. Usuario no encontrado' });

    if(aprobado){
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateDepartamento.estado = 'Validado'
      updateDepartamento.fechaRevision = new Date();
      updateDepartamento.revisor = revisor;
      updateDepartamento.observaciones = observaciones;

      if(original){
        //Actualizar objeto publico
        //Propiedades de objeto
        original.nombre = updateDepartamento.nombre;
        original.geocode = updateDepartamento.geocode;
        //Propiedades de control
        original.version = updateVersion(original.version, aprobado);
        original.ultimaRevision = original.version;
        original.fechaEdicion = updateDepartamento.fechaEdicion;
        original.editor = updateDepartamento.editor;
        original.fechaRevision = new Date();
        original.revisor = revisor;
        original.observaciones = null;
      }
      else{
        const departamento = new Departamento({
          //Propiedades de objeto
          nombre: updateDepartamento.nombre,
          geocode: updateDepartamento.geocode,
          //Propiedades de control
          original: null,
          version: '1.0',
          ultimaRevision: '1.0',
          estado: 'Publicado',
          fechaEdicion: updateDepartamento.fechaEdicion,
          editor: updateDepartamento.editor,
          fechaRevision: new Date(),
          revisor: revisor,
          fechaEliminacion: null,
          eliminador: null,
          observaciones: null,
          pendientes: []
        })
        
        updateDepartamento.original = departamento._id;
  
        await updateDepartamento.save();
  
        departamento.original = departamento._id;
        await departamento.save();
      }
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateDepartamento.estado = 'Rechazado'
      updateDepartamento.fechaRevision = new Date();
      updateDepartamento.revisor = revisor;
      updateDepartamento.observaciones = observaciones;
    }

    if(original){
      let newPendientes = []

      original.pendientes.map(elemento => {
        if(!updateDepartamento.editor._id.equals(elemento._id)){
          newPendientes = newPendientes.concat(elemento);
        }
      })

      original.pendientes = newPendientes;
      await original.save();
    }
    
    await updateDepartamento.save();

    response.json(updateDepartamento);
    return response;
    
  } catch (error) {
    throw error;
  }
}

export async function deleteDepartamento(response, idDepartamento, idEliminador, observaciones=null){
  const departamento = await getDepartamentoById(idDepartamento);
  if(!departamento) return response.status(404).json({ error: 'Error al eliminar el departamento. Departamento no encontrado.' });

  const eliminador = await getUsuarioByIdSimple(idEliminador);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar el departamento. Usuario no encontrado.' });

  departamento.estado = 'Eliminado'
  departamento.fechaEliminacion = new Date();
  departamento.eliminador = eliminador;
  departamento.observaciones = observaciones;

  await departamento.save();

  response.json(departamento);
  return response;
}