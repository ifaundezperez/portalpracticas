import mongoose, { Schema, Document, model } from 'mongoose';

// 1. Interface estandarizada en inglés para el Hito 2
export interface IOffer extends Document {
  title: string;
  description: string;
  companyId: mongoose.Types.ObjectId; // Referencia a la colección de Empresas
  requirements: string[];
  salary: string; 
  modality: 'Presencial' | 'Remoto' | 'Híbrido';
  location: string;
  status: 'Active' | 'Closed';
  applicants: mongoose.Types.ObjectId[]; // Referencia a la colección de Estudiantes
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema optimizado para la Arquitectura MERN
const offerSchema = new Schema<IOffer>({
  title: {
    type: String,
    required: [true, 'El título de la oferta es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  // 🔗 CAMBIO CLAVE: 'companyId' para un populate transparente en el Backend
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company', // Debe coincidir con el nombre del modelo Company
    required: true
  },
  requirements: [{
    type: String 
  }],
  salary: {
    type: String,
    default: 'A convenir'
  },
  modality: {
    type: String,
    enum: ['Presencial', 'Remoto', 'Híbrido'],
    default: 'Presencial'
  },
  location: {
    type: String,
    required: [true, 'La ubicación es obligatoria']
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  },
  // 🔗 CAMBIO CLAVE: 'applicants' para seguimiento de procesos
  applicants: [{
    type: Schema.Types.ObjectId,
    ref: 'Estudiante' // Debe coincidir con el nombre del modelo Student
  }]
}, { 
  timestamps: true // Gestiona automáticamente createdAt y updatedAt
});

const Offer = model<IOffer>('Offer', offerSchema);
export default Offer;