import { Router, Request, Response } from 'express';
import Application from '../models/Application.js'; 

const router = Router();

// --- GET: Obtener postulaciones de un estudiante específico ---
// Requisito funcional: Trazabilidad de procesos para el alumno
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    // Buscamos las postulaciones y "poblamos" la información de la oferta y la empresa
    const applications = await Application.find({ studentId })
      .populate({
        path: 'offerId',
        // Dentro de la oferta, poblamos el nombre de la empresa
        populate: { path: 'companyId', select: 'nombreEmpresa' } 
      })
      .sort({ createdAt: -1 }); 

    res.json(applications);
  } catch (error) {
    console.error('❌ Error al obtener postulaciones:', error);
    res.status(500).json({ message: 'Error al obtener el historial de postulaciones' });
  }
});

// --- POST: Crear una nueva postulación ---
router.post('/postular', async (req: Request, res: Response) => {
  try {
    const { offerId, studentId } = req.body;

    // 1. Validación de datos de entrada
    if (!offerId || !studentId) {
      return res.status(400).json({ message: 'Información incompleta para postular' });
    }

    // 2. Evitar duplicados (Integridad de procesos)
    const existente = await Application.findOne({ offerId, studentId });
    if (existente) {
      return res.status(400).json({ message: 'Ya has postulado a esta oferta de práctica' });
    }

    // 3. Crear la postulación con el nuevo esquema en inglés
    const nuevaPostulacion = new Application({
      offerId,
      studentId,
      status: 'pendiente' 
    });

    await nuevaPostulacion.save();
    res.status(201).json({ message: 'Postulación enviada con éxito' });
  } catch (error: any) {
    // 💡 Imprimimos el error detallado para detectar fallos de validación de Mongoose
    console.error('🔥 Error al procesar postulación:', error.message);
    res.status(500).json({ message: 'Error interno al procesar la postulación' });
  }
});

// --- PATCH: Actualizar el estado de una postulación (Gestión de Empresa) ---
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body; // Se espera 'accepted' o 'rejected'

    const postulacion = await Application.findByIdAndUpdate(
      id,
      { status: nuevoEstado },
      { new: true } // Retorna el documento actualizado
    );

    if (!postulacion) {
      return res.status(404).json({ message: 'Postulación no encontrada' });
    }

    res.json({ 
      message: `Estado actualizado a: ${nuevoEstado}`, 
      postulacion 
    });
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de la postulación' });
  }
});

export default router;