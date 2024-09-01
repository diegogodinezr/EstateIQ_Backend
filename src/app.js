import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import propertieRoutes from './routes/properties.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Agregar este middleware
app.use(cookieParser());
app.use('/api', authRoutes);
app.use('/api', propertieRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export default app;