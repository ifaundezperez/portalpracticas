import { Router } from 'express';
import Student from '../models/Student.js'; 
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// --- REGISTRO DE ESTUDIANTE ---
router.post('/register-student', async (req, res) => {
  try {
    const { nombre, apellidos, rut, email, password, telefono, universidad, carrera, ciudad } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ email }, { rut }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'El correo o RUT ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new Student({
      nombre,
      apellidos,
      rut,
      email,
      password: hashedPassword,
      telefono,
      universidad,
      carrera,
      ciudad
    });

    await newStudent.save();
    res.status(201).json({ message: 'Estudiante registrado con éxito' });
  } catch (error) {
    console.error('Error en register-student:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// --- REGISTRO DE EMPRESA ---
router.post('/register-company', async (req, res) => {
  try {
    const { nombreEmpresa, rutEmpresa, rubro, email, password } = req.body;

    const existingCompany = await Company.findOne({ $or: [{ email }, { rutEmpresa }] });
    if (existingCompany) {
      return res.status(400).json({ message: 'El correo corporativo o RUT de empresa ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCompany = new Company({
      nombreEmpresa,
      rutEmpresa,
      rubro,
      email,
      password: hashedPassword
    });

    await newCompany.save();
    res.status(201).json({ message: 'Empresa registrada con éxito' });
  } catch (error) {
    console.error('Error en register-company:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// --- LOGIN DE ESTUDIANTE ---
router.post('/login-student', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '4h' }
    );

    res.json({ token, user: { id: student._id, nombre: student.nombre, role: 'student' } });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- LOGIN DE EMPRESA ---
router.post('/login-company', async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(401).json({ message: 'Correo o contraseña corporativo incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Correo o contraseña corporativo incorrectos' });
    }

    const token = jwt.sign(
      { id: company._id, role: 'company' },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '4h' }
    );

    res.json({ token, user: { id: company._id, nombre: company.nombreEmpresa, role: 'company' } });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- OBTENER PERFIL DE ESTUDIANTE ---
router.get('/estudiante/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await Student.findById(id).select('-password'); 

    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json(estudiante);
  } catch (error) {
    console.error("Error al buscar estudiante:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// --- ACTUALIZAR PERFIL PROFESIONAL (CV) ---
router.put('/actualizar-perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 🚀 IMPORTANTE: Se agregan 'experiencias' y 'proyectos' al desglose del body
    const { resumen, habilidades, experiencias, proyectos, fechaInicio, fechaFin } = req.body;

    // Actualizamos el documento con TODOS los campos profesionales
    const estudianteActualizado = await Student.findByIdAndUpdate(
      id,
      { 
        resumen, 
        habilidades, 
        experiencias, // Campo pluralizado según tu nuevo esquema Student.ts
        proyectos,    // Campo pluralizado según tu nuevo esquema Student.ts
        fechaInicio, 
        fechaFin 
      },
      { new: true } // Devuelve el objeto ya modificado para verificar en el front
    );

    if (!estudianteActualizado) {
      return res.status(404).json({ message: "No se pudo encontrar al estudiante para actualizar" });
    }

    res.json({ message: "Perfil actualizado exitosamente", estudianteActualizado });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error interno al procesar la actualización" });
  }
});

export default router;