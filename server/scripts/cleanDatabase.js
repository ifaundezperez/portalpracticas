/**
 * Script para limpiar la base de datos de documentos con campo nombres antiguos (español)
 * Ejecutar con: node scripts/cleanDatabase.js
 */

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config(path.join(__dirname, '../.env'));

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portal_practicas');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones (nuevas en inglés y antiguas en español)
    const collections = [
      // Nuevas colecciones (inglés)
      'students',
      'companies',
      'offers',
      'applications',
      // Colecciones antiguas (español) - por si existen
      'estudiantes',
      'empresas',
      'ofertas',
      'postulaciones'
    ];

    for (const collectionName of collections) {
      try {
        const result = await mongoose.connection.collection(collectionName).deleteMany({});
        if (result.deletedCount > 0) {
          console.log(`🗑️  ${collectionName}: Eliminados ${result.deletedCount} documentos`);
        }
      } catch (error) {
        // La colección puede no existir, ignoramos el error
      }
    }

    console.log('\n✅ Base de datos limpiada correctamente');
    console.log('📝 Puedes registrar nuevos usuarios ahora con los campos en inglés');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanDatabase();
