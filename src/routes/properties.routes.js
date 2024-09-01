// backend/routes/properties.routes.js
import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { getProperties, getProperty, createProperty } from '../controllers/properties.controller.js';
import upload from '../multerConfig.js';  // Importa Multer

const router = Router();

router.get('/properties', getProperties);
router.get('/properties/:id', getProperty);
router.post('/properties', upload.array('images', 5), createProperty);  // Usa Multer en la ruta POST

export default router;
