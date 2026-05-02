import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  nombreEmpresa: { type: String, required: true },
  rutEmpresa: { type: String, required: true, unique: true },
  rubro: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'company' } // Para diferenciar roles después
}, { timestamps: true });

export default mongoose.model('Company', CompanySchema);