import mongoose from '@/database';
import Slugify from '@/utils/Slugify';

const AgendamentoSchema = new mongoose.Schema({
  descricao: {
    type: String,
    required: true,
  },
  local: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    unique: true,
  },
  dataHora: {
    type: Date,
    required: true,
    unique: true,
  },
  criadaEm: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

AgendamentoSchema.pre('save', function (next) {
  const descricao = this.descricao;
  this.link = Slugify(descricao);
  next();
});

export default mongoose.model('Agendamento', AgendamentoSchema);
