import jwt from 'jsonwebtoken'
import { createUsuario, deleteUsuario, editUsuario, getUsuarioById, getUsuarios, loginUser } from "../controllers/usuarios-controller.js";

export const getUsuariosEndpoints = (app, upload) => {

  //GET usuarios
  app.post("/api/getusuarios", upload.any(), async (request, response) => {
    try {
      const usuarios = await getUsuarios(
        request.body.idOrganizacion,
        request.body.idCargo,
        request.body.idComponente,
        request.body.idRol
      );
      response.json(usuarios);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener los Usuarios: ' + error });
    }
  })

  //GET Usuario by Id
  app.get("/api/usuario/:idUsuario", upload.any(), async (request, response) => {
    try {
      const usuario = await getUsuarioById(request.params.idUsuario);
      if(!usuario) return response.status(404).send('Usuario no encontrado');

      response.json(usuario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al obtener el usuario: ' + error });
    }
  })

  //POST Usuario
  app.post("/api/usuarios", upload.any(), async (request, response) => {
    try {
      const usuario = await createUsuario(
        request.body.nombre,
        request.body.sexo,
        request.body.idOrganizacion,
        request.body.idCargo,
        request.body.idComponente,
        request.body.idRol,
        request.body.correo,
        request.body.password,
        request.body.idEditor
      );
      response.json(usuario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al registrar el usuario: ' + error });
    }
  })


  //PUT Editar Usuario
  app.put("/api/usuarios", upload.any(), async (request, response) => {
    try {
      const usuario = await editUsuario(
        request.body.idUsuario,
        request.body.nombre,
        request.body.sexo,
        request.body.idOrganizacion,
        request.body.idCargo,
        request.body.idComponente,
        request.body.idRol,
        request.body.correo,
        request.body.idEditor
      );

      if(!usuario) return response.status(404).send('Usuario no encontrado');

      response.json(usuario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al modificar el usuario: ' + error });
    }
  })

  //DELETE Eliminar usuario
  app.delete("/api/usuarios", upload.any(), async (request, response) => {
    try {
      const usuario = await deleteUsuario(request.body.idUsuario);
      if(!usuario) return response.status(404).send('Usuario no encontrado');

      response.json(usuario);
    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al eliminar el usuario: ' + error });
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
        userRol: usuario.rol
      }
      const token = jwt.sign(tokenUser, 'algo', { expiresIn: '2m' });

      response.json({token});

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al hacer el login: ' + error });
    }
  })

  //Verificar auth
  app.post("/api/verify", upload.any(), async (request, response) => {
    try {
      const authorizationHeader = request.headers['authorization'];
  
      if (!authorizationHeader) {
        return response.status(401).json({ message: 'Token de autorización no proporcionado' });
      }

      const token = authorizationHeader.split(' ')[1]; // Ignorar "Bearer" y obtener el token

      var decoded = jwt.verify(token, 'algo');
      response.json({user: decoded});

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al verificar el login: ' + error });
    }
  })

  //Refresh auth
  app.post("/api/refresh", upload.any(), async (request, response) => {
    try {
      var decoded = jwt.verify(request.body.token, request.body.secret);

      const tokenUser = {
        userId: decoded.userId,
        userName: decoded.userName,
        userRol: decoded.userRol
      }

      const token = jwt.sign(tokenUser, 'algo', { expiresIn: '2m' });

      response.json({token});

    } catch (error) {
      response.status(500).json({ error: 'Ocurrió un error al refrescar el token: ' + error });
    }
  })

  return app;
}