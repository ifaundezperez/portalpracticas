import { Router } from 'express';
import Estudiante from '../models/Estudiante.js';

const router = Router();

// --- RUTA DE REGISTRO (POST) ---
// Aquí es donde llegará la info del formulario de registro
router.post('/registro', async (req, res) => {
    try {
        const { nombre, apellidos, rut, email, password, telefono, universidad, carrera, ciudad } = req.body;

        // Creamos una nueva instancia del modelo con los datos recibidos
        const nuevoEstudiante = new Estudiante({
            nombre,
            apellidos,
            rut,
            email,
            password, // En el futuro le pondremos seguridad (hash), por ahora probemos que guarda
            telefono,
            universidad,
            carrera,
            ciudad
        });

        // Guardamos en MongoDB
        const estudianteGuardado = await nuevoEstudiante.save();
        
        res.status(201).json({
            mensaje: "Estudiante registrado con éxito",
            id: estudianteGuardado._id
        });

    } catch (error: any) {
        // Si el RUT o Email ya existen, MongoDB lanzará un error
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: "El RUT o el Email ya están registrados" });
        }
        res.status(500).json({ mensaje: "Error al registrar estudiante", error });
    }
});

export default router;