import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import propertieRoutes from './routes/properties.routes.js';
import cors from 'cors';

const app = express();

// Configura CORS para permitir el frontend
app.use(cors({
  origin: ['https://estate-iq-web.vercel.app', 'http://localhost:5173'], 
  credentials: true, // Permite el envío de cookies
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api', propertieRoutes);

// Ya no necesitas servir archivos estáticos localmente
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export default app;
