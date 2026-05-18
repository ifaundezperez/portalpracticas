import { Router } from 'express';
import Offer from '../models/Offer.js';
import Application from '../models/Application.js';
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
    const ofertas = await Offer.find().populate('companyId', 'companyName');
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

// --- PUT: Editar una oferta ---
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, salary, modality, requirements } = req.body;

    // Validar que la oferta existe
    const oferta = await Offer.findById(id);
    if (!oferta) {
      return res.status(404).json({ message: 'Oferta no encontrada' });
    }

    // Actualizar solo los campos que vinieron en el request
    if (title) oferta.title = title;
    if (description) oferta.description = description;
    if (location) oferta.location = location;
    if (salary) oferta.salary = salary;
    if (modality) oferta.modality = modality;
    if (requirements) oferta.requirements = Array.isArray(requirements) ? requirements : requirements.split(',').map((r: string) => r.trim());

    await oferta.save();
    res.json({ message: 'Oferta actualizada con éxito', oferta });
  } catch (error) {
    console.error('❌ Error al editar oferta:', error);
    res.status(500).json({ message: 'Error al editar la oferta' });
  }
});

// --- DELETE: Eliminar una oferta (las postulaciones se mantienen con referencia nula) ---
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que la oferta existe
    const oferta = await Offer.findById(id);
    if (!oferta) {
      return res.status(404).json({ message: 'Oferta no encontrada' });
    }

    // Contar las postulaciones antes de eliminar
    const postulacionesCount = await Application.countDocuments({ offerId: id });

    // Eliminar la oferta (las postulaciones quedan con offerId pero sin referencia)
    await Offer.findByIdAndDelete(id);

    console.log(`🗑️  Oferta eliminada. ${postulacionesCount} postulaciones quedan en historial`);

    res.json({
      message: 'Oferta eliminada con éxito',
      postulacionesEnHistorial: postulacionesCount
    });
  } catch (error) {
    console.error('❌ Error al eliminar oferta:', error);
    res.status(500).json({ message: 'Error al eliminar la oferta' });
  }
});

export default router;