import jwt from 'jsonwebtoken'
import { createUsuario, deleteUsuario, editUsuario, getCountUsuarios, getListUsuarios, getPagedUsuarios, getRevisionesUsuario, getUsuarioById, loginUser, revisarUpdateUsuario } from "../controllers/usuarios-controller.js";
import { decodeToken } from '../utilities/jwtDecoder.js';

export const getUsuariosEndpoints = (app, upload) => {

  //GET count usuarios
  app.post("/api/count/usuarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getCountUsuarios({
        header: authorizationHeader,
        response,
        filterParams: JSON.parse(request.body.filter),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los usuarios: ' + error });
    }
  })

  //POST Get PAGED usuarios
  app.post("/api/paged/usuarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getPagedUsuarios({
        header: authorizationHeader,
        response,
        page: request.body.page,
        pageSize: request.body.pageSize,
        filter: JSON.parse(request.body.filter),
        sort: JSON.parse(request.body.sort),
        reviews: JSON.parse(request.body.reviews),
        deleteds: JSON.parse(request.body.deleteds)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los usuarios: ' + error });
    }
  })


  //POST Get List usuarios
  app.post("/api/list/usuarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getListUsuarios({
        header: authorizationHeader,
        response,
        filter: JSON.parse(request.body.filter)
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los usuarios: ' + error });
    }
  })


  //GET usuario by Id
  app.get("/api/usuario/:idUsuario", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getUsuarioById(
        authorizationHeader,
        response,
        request.params.idUsuario
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener Usuario: ' + error });
    }
  })


  //GET revisiones beneficiario
  app.get("/api/revisiones/usuario/:idUsuario", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await getRevisionesUsuario(
        authorizationHeader,
        response,
        request.params.idUsuario
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener las revisiones del Usuario: ' + error });
    }
  })


  //POST usuario
  app.post("/api/usuarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await createUsuario({
        header: authorizationHeader,
        response,
        nombre: request.body.nombre,
        dni: request.body.dni,
        telefono: request.body.telefono,
        idComponente: request.body.idComponente,
        correo: request.body.correo,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
      });
      
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar Usuario: ' + error });
    }
  })


  //PUT modificar usuario
  app.put("/api/usuarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await editUsuario({
        header: authorizationHeader,
        response,
        idUsuario: request.body.idUsuario,
        nombre: request.body.nombre,
        dni: request.body.dni,
        telefono: request.body.telefono,
        idComponente: request.body.idComponente,
        idRol: request.body.idRol,
        aprobar: JSON.parse(request.body.aprobar)
      });

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar Usuario: ' + error });
    }
  })


  //PUT revisar usuarios
  app.put("/api/revisiones/usuarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await revisarUpdateUsuario(
        authorizationHeader,
        response,
        request.body.id,
        JSON.parse(request.body.aprobado),
        request.body.idRol,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al revisar Usuario: ' + error });
    }
  })


  //DELETE eliminar usuario
  app.delete("/api/usuarios", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];

      response = await deleteUsuario(
        authorizationHeader,
        response,
        request.body.id,
        request.body.observaciones,
      );

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar Usuario: ' + error });
    }
  })


  //Login
  app.post("/api/login", upload.any(), async (request, response) => {
    try {
      const usuario = await loginUser(
        request.body.email, 
        request.body.password
      );
      if(!usuario) return response.status(404).json({ error: 'Los datos ingresados no son válidos.' });
      
      const tokenUser = {
        userId: usuario._id,
        userName: usuario.nombre,
        userEmail: usuario.correo,
        userComponente: usuario.componente,
        userRolId: usuario.rol?._id,
        userPermisos: usuario.rol?.permisos
      }
      const token = jwt.sign(tokenUser, 'algo', { expiresIn: '12h' });

      response.json({token});

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al hacer el login: ' + error });
    }
  })

  //Verificar auth
  app.get("/api/verify", async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];
      const auth = decodeToken(authorizationHeader);
      if(auth.code !== 200) return response.status(auth.code).json({ error: 'Ocurrió un error al verificar el login: ' + auth.payload });

      response.json({user: auth.payload});

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al verificar el login: ' + error });
    }
  })


  //Refresh auth
  app.get("/api/refresh", async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];
      const auth = decodeToken(authorizationHeader);
      if(auth.code !== 200) return response.status(auth.code).json({ error: 'Ocurrió un error al verificar el login: ' + auth.payload });

      const tokenUser = {
        userId: auth.payload.userId,
        userName: auth.payload.userName,
        userEmail: auth.payload.userEmail,
        userComponente: auth.payload.userComponente,
        userRolId: auth.payload.userRolId,
        userPermisos: auth.payload.userPermisos
      }

      const newToken = jwt.sign(tokenUser, 'algo', { expiresIn: '5h' });
      response.json({token: newToken});

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al refrescar el token: ' + error });
    }
  })

  return app;
}