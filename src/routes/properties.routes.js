// backend/routes/properties.routes.js
import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { getProperties, getProperty, createProperty } from '../controllers/properties.controller.js';
import upload from '../multerConfig.js'; // Importa Multer

const router = Router();

// Rutas para obtener propiedades
router.get('/properties', getProperties);
router.get('/properties/:id', getProperty);

// Ruta para crear una propiedad (solo para usuarios autenticados)
router.post('/properties', authRequired, upload.array('images', 5), createProperty);

export default router;
