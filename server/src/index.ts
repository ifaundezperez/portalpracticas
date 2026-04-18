import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import estudianteRoutes from './routes/estudianteRoutes.js';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Para que el Frontend se pueda comunicar con el Backend)
app.use(cors());
app.use(express.json());

//Uso de ruta del estudiante
app.use('/api/estudiantes', estudianteRoutes);

// Conexión a MongoDB (Tu Capa de Datos)
const mongoUri = process.env.MONGO_URI || '';

mongoose.connect(mongoUri)
    .then(() => console.log('✅ Conexión exitosa a MongoDB'))
    .catch((error) => console.error('❌ Error conectando a la base de datos:', error));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor del Portal de Prácticas funcionando');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});