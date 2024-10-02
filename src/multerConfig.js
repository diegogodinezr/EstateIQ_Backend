import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinaryConfig.js'; // Importamos la configuración de Cloudinary

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Carpeta en Cloudinary donde se guardarán las imágenes
    allowed_formats: ['jpg', 'png', 'jpeg'], // Formatos permitidos
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Nombre del archivo en Cloudinary
  },
});

// Filtro de archivos para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de tamaño de archivo de 5MB
});

export default upload;
