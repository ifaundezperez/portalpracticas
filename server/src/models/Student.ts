import { Schema, model } from 'mongoose';

const EstudianteSchema = new Schema({
    // DATOS DE REGISTRO
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telefono: { type: String, required: true },
    universidad: { type: String, required: true },
    carrera: { type: String, required: true },
    ciudad: { type: String, required: true },

    // SISTEMA DE ROLES
    rol: { type: String, default: 'estudiante' },

    // PERFIL PROFESIONAL (Campos actualizados para el Generador de CV)
    // Los dejamos en la raíz para que coincidan con el fetch del frontend
    resumen: { type: String, default: "" }, 
    habilidades: { type: [String], default: [] },
    experiencias: { type: [String], default: [] },
    proyectos: { type: [String], default: [] },
    
    // Fechas de carrera para el CV
    fechaInicio: { type: Date },
    fechaFin: { type: Date },

    // METADATOS
    fechaRegistro: { type: Date, default: Date.now }
}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

// Exportamos el modelo único
export default model('Estudiante', EstudianteSchema);