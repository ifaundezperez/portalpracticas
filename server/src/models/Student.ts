import { Schema, model } from 'mongoose';

const StudentSchema = new Schema({
    // DATOS DE REGISTRO
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    studentRUT: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    university: { type: String, required: true },
    career: { type: String, required: true },
    city: { type: String, required: true },

    // SISTEMA DE ROLES
    role: { type: String, default: 'student' },

    // PERFIL PROFESIONAL (Campos para el generador de CV)
    summary: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: [String], default: [] },
    projects: { type: [String], default: [] },

    // Fechas de carrera para el CV
    startDate: { type: Date },
    endDate: { type: Date },

    // METADATOS
    registrationDate: { type: Date, default: Date.now }
}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

// Exportamos el modelo
export default model('Student', StudentSchema);