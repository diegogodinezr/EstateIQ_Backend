import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty 
} from '../controllers/properties.controller.js';
import upload from '../multerConfig.js'; // Importa Multer

const router = Router();

// Rutas para obtener propiedades
router.get('/properties', getProperties);         // Obtener todas las propiedades
router.get('/properties/:id', getProperty);       // Obtener una propiedad específica por ID

// Ruta para crear una propiedad (solo para usuarios autenticados)
router.post('/properties', authRequired, upload.array('images', 5), createProperty);

// Ruta para modificar una propiedad (solo para el propietario de la propiedad)
router.put('/properties/:id', authRequired, upload.array('images', 5), updateProperty);

// Ruta para eliminar una propiedad (solo para el propietario de la propiedad)
router.delete('/properties/:id', authRequired, deleteProperty);

export default router;
