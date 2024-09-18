import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user', // El rol por defecto es 'user'
        enum: ['user', 'admin'] // Solo puede ser 'user' o 'admin'
    }
});

export default mongoose.model('User', userSchema);
