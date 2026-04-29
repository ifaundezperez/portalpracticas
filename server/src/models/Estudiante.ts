import { Schema, model } from 'mongoose';

const EstudianteSchema = new Schema({
    // DATOS DE REGISTRO (Campos obligatorios para login y contacto)
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telefono: { type: String, required: true },
    universidad: { type: String, required: true },
    carrera: { type: String, required: true },
    ciudad: { type: String, required: true },

    // SISTEMA DE ROLES (Indispensable para la seguridad de las rutas)
    rol: { type: String, default: 'estudiante' },

    // PERFIL PROFESIONAL (Información para el Generador de CV)
    perfil: {
        descripcionBusqueda: { type: String, default: "" }, 
        habilidades: { type: [String], default: [] },
        experiencia: [{
            empresa: String,
            cargo: String,
            duracion: String,
            descripcion: String
        }],
        proyectos: [{
            nombre: String,
            url: String,
            descripcion: String
        }]
    },

    // METADATOS
    fechaRegistro: { type: Date, default: Date.now }
});

export default model('Estudiante', EstudianteSchema);