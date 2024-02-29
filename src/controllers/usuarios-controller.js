import { createHash } from 'crypto';
import Usuario from "../models/usuarios.js";
import { decodeToken } from "../utilities/jwtDecoder.js";
import { getFilter, getSorting } from "../utilities/queryConstructor.js";
import { updateVersion } from "../utilities/versionHelper.js";
import { privateGetRolById } from "./roles-controller.js";
import { privateGetComponenteById } from './componentes-controller.js';


function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

//Login
export async function loginUser(email, password){
  try{
    const usuario = await Usuario.findOne({correo: email, password: hashPassword(password), estado:'Publicado'}).populate('rol');
    return usuario;
  } catch (error) {
    throw error;
  }
}

//Internos para validacion de claves unicas
async function validateUniquesUsuario({id=null, dni=null, correo=null}){
  let filter = {estado: { $in: ['Publicado', 'Eliminado'] }}

  if(id){
    filter = {...filter, _id: {$nin: [id] }}
  }

  if(dni){
    filter = {...filter, dni: dni}
  }

  if(correo){
    filter = {...filter, correo: correo}
  }

  return Usuario.exists(filter);
}

//Get internal
export async function privateGetUsuarioById(idUsuario){
  try {
    return Usuario.findById(idUsuario)

  } catch (error) {
    throw error;
  }
}

//Get Count
export async function getCountUsuarios({header, response, filterParams, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Usuarios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Usuarios'] === false){
      return response.status(401).json({ error: 'Error al obtener Usuarios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Usuarios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    const filter = getFilter({filterParams, reviews, deleteds})

    const count = await Usuario.count(filter);

    response.json({ count });
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info Paged
export async function getPagedUsuarios({header, response, page, pageSize, sort, filter, reviews=false, deleteds=false}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Usuarios. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.vistas['Configuración']['Usuarios'] === false){
      return response.status(401).json({ error: 'Error al obtener Usuarios. No cuenta con los permisos suficientes.'});
    }

    if(rol && rol.permisos.acciones['Usuarios']['Ver Eliminados'] === false){
      deleteds = false;
    }

    //Paginacion
    const skip = (page) * pageSize

    //Sort
    const sortQuery = getSorting({sort, reviews, defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter, reviews, deleteds})

    const usuarios = await Usuario.find(filterQuery, '-password').sort(sortQuery).skip(skip).limit(pageSize).populate([
      {
      path: 'rol editor revisor eliminador',
      select: '_id nombre',
      },
      {
        path: 'componente',
        select: '_id nombre descripcion',
      }
    ]);

    response.json(usuarios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get Info List
export async function getListUsuarios({header, response, filter}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Usuarios. ' + auth.payload });

    //Sort
    const sortQuery = getSorting({defaultSort: { nombre: 1 }})

    //Filter
    const filterQuery = getFilter({filterParams: filter})

    const usuarios = await Usuario.find(filterQuery, '_id nombre').limit(50).sort(sortQuery);

    response.json(usuarios);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get individual 
export async function getUsuarioById(header, response, idUsuario){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Usuario. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && (rol.permisos.vistas['Configuración']['Usuarios'] === false && rol.permisos.acciones['Usuarios']['Revisar'] === false)){
      return response.status(401).json({ error: 'Error al obtener Usuario. No cuenta con los permisos suficientes.'});
    }

    const usuario = await Usuario.findById(idUsuario, '-password').populate([
    {
      path: 'componente rol editor revisor eliminador',
      select: '_id nombre',
    }]);

    response.json(usuario);
    return response;

  } catch (error) {
    throw error;
  }
}


//Get revisiones usuario
export async function getRevisionesUsuario(header, response, idUsuario){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al obtener Revisiones de Usuario. ' + auth.payload });
    
    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Usuarios']['Ver Historial'] === false){
      return response.status(401).json({ error: 'Error al obtener Revisiones de Usuario. No cuenta con los permisos suficientes.'});
    }

    const revisiones = await Usuario.find({original: {_id: idUsuario}, estado: { $nin: ['Publicado', 'Eliminado'] }}, '-password').sort({version: -1}).populate([
    {
      path: 'componente rol editor revisor eliminador',
      select: '_id nombre',
    }]);
    
    response.json(revisiones);
    return response; 

  } catch (error) {
    throw error;
  }
}

//Crear usuario
export async function createUsuario({header, response, nombre, dni, 
  telefono, idComponente, correo, password, confirmPassword}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al crear Usuario. ' + auth.payload });
    
    if(password !== confirmPassword) return response.status(400).json({ error: `Las contraseñas proporcionadas no coinciden.` });

    const existentDNI = await validateUniquesUsuario({dni})
    if(existentDNI) return response.status(400).json({ error: `Error al crear Usuario. El DNI ${dni} ya está en uso.` });

    const existentCorreo = await validateUniquesUsuario({correo})
    if(existentCorreo) return response.status(400).json({ error: `Error al crear Usuario. El correo electrónico ${correo} ya está en uso.` });

    const componente = await privateGetComponenteById(idComponente)
    
    const usuario = new Usuario({
      //Propiedades de objeto
      nombre,
      dni,
      telefono,
      componente,
      correo: correo,
      password: hashPassword(password),
      //Propiedades de control
      original: null,
      version: '0.1',
      ultimaRevision: '0.1',
      estado: 'En revisión',
      fechaEdicion: new Date(),
      editor: null,
      fechaRevision: null,
      revisor: null,
      fechaEliminacion: null,
      eliminador: null,
      observaciones: null,
      pendientes: []
    })

    await usuario.save();
    response.json(usuario);
    return response;
  } catch (error) {
    throw error;
  }
}


//Edit info
export async function editUsuario({header, response, idUsuario, nombre, dni, 
  telefono, idComponente, idRol, aprobar=true}){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al editar Usuario. ' + auth.payload });

    //Validacion de usuario
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(auth.payload.userId !== idUsuario && (rol && rol.permisos.acciones['Usuarios']['Modificar'] === false)){
      return response.status(401).json({ error: 'Error al editar Usuario. No cuenta con los permisos suficientes.'});
    }

    const usuario = await privateGetUsuarioById(idUsuario);
    if(!usuario) return response.status(404).json({ error: 'Error al editar Usuario. Usuario no encontrado.' });

    const editor = await privateGetUsuarioById(auth.payload.userId);
    if(!editor) return response.status(404).json({ error: 'Error al editar Usuario. Editor no encontrado.' });

    const existentDNI = await validateUniquesUsuario({dni, id: idUsuario})
    if(existentDNI) return response.status(400).json({ error: `Error al editar Usuario. El DNI ${dni} ya está en uso.` });

    const promises = await Promise.all([
      privateGetComponenteById(idComponente),
      privateGetRolById(idRol)
    ])

    //Crear objeto de actualizacion
    const updateUsuario = new Usuario({
      //Propiedades de objeto
      nombre,
      dni,
      telefono,
      componente: promises[0],
      rol: promises[1],
      correo: usuario.correo,
      password: usuario.password,
      //Propiedades de control
      original: usuario._id,
      version: updateVersion(usuario.ultimaRevision),
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
      usuario.nombre = nombre;
      usuario.dni = dni;
      usuario.telefono = telefono;
      usuario.componente = promises[0],
      usuario.rol = promises[1],
      //Propiedades de control
      usuario.version = updateVersion(usuario.version, aprobar);
      usuario.ultimaRevision = usuario.version;
      usuario.fechaEdicion = new Date();
      usuario.editor = editor;
      usuario.fechaRevision = new Date();
      usuario.revisor = editor;
      usuario.observaciones = null;
    }

    await updateUsuario.save();
    await usuario.save();

    response.json(updateUsuario);
    return response;

  } catch (error) {
    throw error;
  }
}


//Review 
export async function revisarUpdateUsuario(header, response, idUsuario, aprobado, idRol, observaciones){
  try {
    const auth = decodeToken(header);
    if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al revisar Usuario. ' + auth.payload });

    //Validaciones de rol
    const rol = await privateGetRolById(auth.payload.userRolId);
    if(rol && rol.permisos.acciones['Usuarios']['Revisar'] === false){
      return response.status(401).json({ error: 'Error al revisar Usuario. No cuenta con los permisos suficientes.'});
    }

    const updateUsuario = await privateGetUsuarioById(idUsuario);
    if(!updateUsuario) return response.status(404).json({ error: 'Error al revisar Usuario. Revisión no encontrada.' });

    const original = await privateGetUsuarioById(updateUsuario.original);
    if(!original && updateUsuario.version !== '0.1') return response.status(404).json({ error: 'Error al revisar Usuario. Usuario no encontrado.' });

    const revisor = await privateGetUsuarioById(auth.payload.userId);
    if(!revisor) return response.status(404).json({ error: 'Error al revisar Usuario. Revisor no encontrado.' });

    if(aprobado){
      const newRol = await privateGetRolById(idRol);
      if(!newRol) return response.status(404).json({ error: 'Error al revisar Usuario. Rol no encontrado.' });
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateUsuario.estado = 'Validado'
      updateUsuario.fechaRevision = new Date();
      updateUsuario.revisor = revisor;
      updateUsuario.observaciones = observaciones;

      const usuario = new Usuario({
        //Propiedades de objeto
        nombre: updateUsuario.nombre,
        dni: updateUsuario.dni,
        telefono: updateUsuario.telefono,
        componente: updateUsuario.componente,
        rol: newRol,
        correo: updateUsuario.correo,
        password: updateUsuario.password,
        //Propiedades de control
        original: null,
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        fechaEdicion: updateUsuario.fechaEdicion,
        editor: null,
        fechaRevision: new Date(),
        revisor: revisor,
        fechaEliminacion: null,
        eliminador: null,
        observaciones: null,
        pendientes: []
      })
      
      updateUsuario.original = usuario._id;
      updateUsuario.rol = newRol;
      updateUsuario.editor = usuario._id;

      await updateUsuario.save();

      usuario.editor = updateUsuario.editor;
      usuario.original = usuario._id;
      await usuario.save();
      
    }
    else{
      //Actualizar objeto de actualizacion
      //Propiedades de control 
      updateUsuario.estado = 'Rechazado'
      updateUsuario.fechaRevision = new Date();
      updateUsuario.revisor = revisor;
      updateUsuario.observaciones = observaciones;
    }

    await updateUsuario.save();

    response.json(updateUsuario);
    return response;

  } catch (error) {
    throw error;
  }
}



//Delete undelete
export async function deleteUsuario(header, response, idUsuario, observaciones=null){
  const auth = decodeToken(header);
  if(auth.code !== 200) return response.status(auth.code).json({ error: 'Error al eliminar Usuario. ' + auth.payload });

  //Validaciones de rol
  const rol = await privateGetRolById(auth.payload.userRolId);
  if(rol && rol.permisos.acciones['Usuarios']['Eliminar'] === false){
    return response.status(401).json({ error: 'Error al eliminar Usuario. No cuenta con los permisos suficientes.'});
  }

  const usuario = await privateGetUsuarioById(idUsuario);
  if(!usuario) return response.status(404).json({ error: 'Error al eliminar Usuario. Usuario no encontrado.' });

  const eliminador = await privateGetUsuarioById(auth.payload.userId);
  if(!eliminador) return response.status(404).json({ error: 'Error al eliminar Usuario. Eliminador no encontrado.' });

  if(usuario.estado !== 'Eliminado'){
    usuario.estado = 'Eliminado'
    usuario.fechaEliminacion = new Date();
    usuario.eliminador = eliminador;
    usuario.observaciones = observaciones;
  }

  else{
    usuario.estado = 'Publicado'
    usuario.fechaEliminacion = null;
    usuario.eliminador = null;
    usuario.observaciones = null;
  }
  

  await usuario.save();

  response.json(usuario);
  return response;
}
