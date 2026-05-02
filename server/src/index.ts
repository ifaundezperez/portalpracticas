import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import offerRoutes from './routes/offerRoutes.js';
import authRoutes from './routes/authRoutes.js'; // 👈 Cambiamos el nombre del import
import applicationRoutes from './routes/applicationRoutes.js';

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/offers', offerRoutes);
app.use('/api/applications', applicationRoutes);

// Routes
// Esto hace que todas las rutas dentro de authRoutes empiecen con /api/auth
app.use('/api/auth', authRoutes); 

// Database Connection
const mongoUri = process.env.MONGO_URI || '';

mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB connection successful'))
    .catch((error) => console.error('❌ Database connection error:', error));

// Health Check
app.get('/', (req, res) => {
    res.send('Portal de Prácticas Server is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});