import { Router } from 'express';
import Student from '../models/Student.js'; 
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// --- REGISTRO DE ESTUDIANTE ---
router.post('/register-student', async (req, res) => {
  try {
    const { firstName, lastName, studentRUT, email, password, phone, university, career, city } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ email }, { studentRUT }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'El correo o RUT ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new Student({
      firstName,
      lastName,
      studentRUT,
      email,
      password: hashedPassword,
      phone,
      university,
      career,
      city
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
    const { companyName, companyRUT, industry, email, password } = req.body;

    const existingCompany = await Company.findOne({ $or: [{ email }, { companyRUT }] });
    if (existingCompany) {
      return res.status(400).json({ message: 'El correo corporativo o RUT de empresa ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCompany = new Company({
      companyName,
      companyRUT,
      industry,
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

    res.json({ token, user: { id: student._id, firstName: student.firstName, role: 'student' } });
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

    res.json({ token, user: { id: company._id, companyName: company.companyName, role: 'company' } });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- OBTENER PERFIL DE ESTUDIANTE ---
router.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).select('-password'); 

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json(student);
  } catch (error) {
    console.error("Error al buscar estudiante:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// --- ACTUALIZAR PERFIL PROFESIONAL (CV) ---
router.put('/update-profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { summary, skills, experience, projects, startDate, endDate } = req.body;

    // Actualizamos el documento con todos los campos profesionales
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        summary,
        skills,
        experience,
        projects,
        startDate,
        endDate
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.json({ message: "Perfil actualizado exitosamente", updatedStudent });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error al procesar la actualización" });
  }
});

// --- GET: Obtener datos de una empresa específica ---
router.get('/company/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id).select('-password');
    if (!company) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.json(company);
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    res.status(500).json({ message: "Error al obtener datos de la empresa" });
  }
});

// --- ACTUALIZAR PERFIL DE EMPRESA ---
router.put('/update-company-profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, companyRUT, industry, phone, website, description } = req.body;

    // Validar que no haya otro RUT igual (si cambió)
    if (companyRUT) {
      const existingCompany = await Company.findOne({ companyRUT, _id: { $ne: id } });
      if (existingCompany) {
        return res.status(400).json({ message: 'El RUT ya está registrado en otra empresa' });
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      {
        companyName,
        companyRUT,
        industry,
        phone,
        website,
        description
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.json({ message: "Perfil de empresa actualizado exitosamente", updatedCompany });
  } catch (error) {
    console.error("Error al actualizar perfil de empresa:", error);
    res.status(500).json({ message: "Error al procesar la actualización" });
  }
});

export default router;