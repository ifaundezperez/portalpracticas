import { Schema, model } from 'mongoose';

const EmpresaSchema = new Schema({
    nombreEmpresa: { type: String, required: true },
    rutEmpresa: { type: String, required: true, unique: true },
    rubro: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sitioWeb: { type: String },
    descripcion: { type: String },
    rol: { type: String, default: 'empresa' }, // Para que el sistema sepa quién es quién
    fechaRegistro: { type: Date, default: Date.now }
});

export default model('Empresa', EmpresaSchema);