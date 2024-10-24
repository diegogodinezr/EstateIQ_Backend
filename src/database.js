import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB is Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
