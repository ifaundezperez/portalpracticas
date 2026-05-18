import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyRUT: { type: String, required: true, unique: true },
  industry: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'company' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Company', CompanySchema);