import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import authConfig from '@/config/auth';
import Usuario from '@/app/schemas/Usuario';

const router = new Router();

const gerarToken = (parametros) => {
  return jwt.sign(parametros, authConfig.secret, { expiresIn: 86400 });
};

router.post('/registrar', (req, res) => {
  const { email, nome, senha } = req.body;

  Usuario.findOne({ email })
    .then((dadosUsuario) => {
      if (dadosUsuario) {
        return res.status(400).send({
          erro: 'O usuário já existe',
        });
      } else {
        Usuario.create({ nome, email, senha })
          .then((usuario) => {
            usuario.senha = undefined;
            return res.status(200).send(usuario);
          })
          .catch((erro) => {
            console.error(
              'Erro ao salvar um novo usuário no banco de dados',
              erro,
            );
            return res.status(400).send({
              erro: 'Falha ao registrar o usuário',
            });
          });
      }
    })
    .catch((erro) => {
      console.error('Erro ao consultar o usuário no banco de dados', erro);
      return res.status(500).send({
        erro: 'O cadastro falhou',
      });
    });
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  Usuario.findOne({ email })
    .select('+senha')
    .then((usuario) => {
      if (usuario) {
        bcrypt
          .compare(senha, usuario.senha)
          .then((resultado) => {
            if (resultado) {
              const token = gerarToken({ uid: usuario.id });
              return res.status(200).send({ token: token, expiraEm: '1d' });
            } else {
              return res.status(400).send({ erro: 'Senha inválida' });
            }
          })
          .catch((erro) => {
            console.error('Erro ao vefificar a senha', erro);
            return res.status(500).send({
              erro: 'O login falhou',
            });
          });
      } else {
        return res.status(404).send({
          erro: 'Usuário não encontrado',
        });
      }
    })
    .catch((erro) => {
      console.error('Erro ao logar o usuário no banco de dados', erro);
      return res.status(500).send({
        erro: 'O login falhou',
      });
    });
});

router.post('/esqueci-minha-senha', (req, res) => {});

router.post('/trocar-senha', (req, res) => {});

export default router;
