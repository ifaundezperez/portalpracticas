// server/src/models/Application.ts
import mongoose, { Schema, Document, model } from 'mongoose';

export interface IApplication extends Document {
  offerId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

const applicationSchema = new Schema<IApplication>({
  // 🚀 CAMBIO: De 'oferta' a 'offerId'
  offerId: {
    type: Schema.Types.ObjectId,
    ref: 'Offer', // Asegúrate de que coincida con el nombre del modelo de ofertas
    required: [true, 'El ID de la oferta es obligatorio']
  },
  // Student reference
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'El ID del estudiante es obligatorio']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Application = model<IApplication>('Application', applicationSchema);
export default Application;