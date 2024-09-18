import {Router} from 'express';
import {register, login, logout, profile, getStatistics} from '../controllers/auth.controller.js';
import {authRequired} from '../middlewares/validateToken.js';
import {isAdmin} from '../middlewares/isAdmin.js';  // Asegúrate de importar este middleware

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authRequired, profile);

// Nueva ruta para estadísticas, solo accesible por admin
router.get('/statistics', authRequired, isAdmin, getStatistics);

export default router;
