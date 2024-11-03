import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Campos desglosados para la ubicación
  calleYNumero: {
    type: String,
    required: true,
  },
  colonia: {
    type: String,
    required: true,
  },
  codigoPostal: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
  },
  municipio: {
    type: String,
    required: true,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  squaremeters: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  type: {
    type: String,
    enum: ['sale', 'rent'],
    required: true,
    default: 'sale',
  },
  propertyType: {
    type: String,
    enum: ['House', 'Apartment', 'Land', 'Commercial'],
    required: true,
    default: 'House',
  },
  contactNumber: {
    type: String,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
  physicalVisits: {
    type: Number,
    default: 0,
  },
  deletedAt: {
    type: Date,
  },
  deleteReason: {
    type: String,
    enum: ['completed', 'cancelled', 'other'],
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active',
  },
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
