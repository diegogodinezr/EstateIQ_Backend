import { Router } from 'express';
import {
  register,
  login,
  logout,
  profile,
  getStatistics
} from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/validateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';  // Asegúrate de importar este middleware

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para cerrar sesión
router.post('/logout', logout);

// Ruta para obtener el perfil del usuario, requiere autenticación
router.get('/profile', authRequired, profile);

// Nueva ruta para estadísticas, solo accesible por admin
router.get('/statistics', authRequired, isAdmin, getStatistics);

export default router;
