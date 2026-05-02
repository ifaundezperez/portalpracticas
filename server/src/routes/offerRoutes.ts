import { Router } from 'express';
import Offer from '../models/Offer.js';
const router = Router();

// --- POST: Crear una nueva oferta ---
router.post('/crear', async (req, res) => {
  try {
    const { 
      title,       // 👈 Usamos nombres en inglés para coincidir con el Front
      description, 
      companyId, 
      requirements, 
      salary, 
      modality, 
      location 
    } = req.body;

    const nuevaOferta = new Offer({
      title,
      description,
      companyId,   // 👈 Debe coincidir con el campo de tu esquema Offer
      requirements,
      salary,
      modality,
      location
    });

    await nuevaOferta.save();
    res.status(201).json({ message: 'Oferta publicada con éxito', oferta: nuevaOferta });
  } catch (error) {
    console.error('🔥 Error al crear oferta:', error);
    res.status(500).json({ message: 'Error interno al publicar la oferta' });
  }
});

// --- GET: Obtener todas las ofertas ---
// 👈 IMPORTANTE: Usamos '/' para que la URL sea 'api/offers/' y coincida con el fetch()
router.get('/', async (req, res) => {
  try {
    // Populamos companyId para traer el nombre de la empresa al Home del alumno
    const ofertas = await Offer.find().populate('companyId', 'nombreEmpresa');
    res.json(ofertas);
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ message: 'Error al obtener ofertas' });
  }
});

// --- GET: Obtener ofertas de una empresa específica ---
router.get('/empresa/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const ofertas = await Offer.find({ companyId }).sort({ createdAt: -1 });
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus ofertas' });
  }
});

export default router;