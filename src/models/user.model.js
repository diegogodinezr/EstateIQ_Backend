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
        default: 'user',
        enum: ['user', 'admin']
    }
}, {
    timestamps: true // Agrega automáticamente los campos `createdAt` y `updatedAt`
});

const User = mongoose.model('User', userSchema);
export default User;
