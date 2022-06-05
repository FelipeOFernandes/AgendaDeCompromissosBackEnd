import mongoose from '@/database';
import bcrypt from 'bcryptjs';

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: true,
    select: false,
  },
  criadaEm: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

UsuarioSchema.pre('save', function (next) {
  bcrypt
    .hash(this.senha, 10)
    .then((hash) => {
      this.senha = hash;
      next();
    })
    .catch((erro) => {
      console.error('Erro na criação do hash', erro);
    });
});

export default mongoose.model('Usuario', UsuarioSchema);
