import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import authConfig from '@/config/auth';
import Usuario from '@/app/schemas/Usuario';
import Mailer from '@/modules/Mailer';
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
            console.error('Erro ao salvar um novo usuário', erro);
            return res.status(400).send({
              erro: 'Falha ao registrar o usuário',
            });
          });
      }
    })
    .catch((erro) => {
      console.error('Erro ao buscar o usuário', erro);
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
      console.error('Erro ao logar o usuário', erro);
      return res.status(500).send({
        erro: 'O login falhou',
      });
    });
});

router.post('/esqueci-minha-senha', (req, res) => {
  const { email } = req.body;

  Usuario.findOne({ email })
    .then((usuario) => {
      if (usuario) {
        const token = crypto.randomBytes(20).toString('hex');
        const expiracao = new Date();
        expiracao.setHours(new Date().getHours() + 3);

        Usuario.findByIdAndUpdate(usuario.id, {
          $set: {
            tokenDeTrocaDeSenha: token,
            validadeTokenDeTrocaDeSenha: expiracao,
          },
        })
          .then(() => {
            Mailer.sendMail(
              {
                to: email,
                from: 'AgendaDeCompromissos@teste.com',
                template: 'auth/esqueci_minha_senha',
                context: { token },
              },
              (erro) => {
                if (erro) {
                  console.error('Erro ao enviar email', erro);
                  return res.status(400).send({
                    erro: 'Não foi possível enviar o email de recuperação de senha',
                  });
                } else {
                  return res.send();
                }
              },
            );
          })
          .catch((erro) => {
            console.error('Erro ao salvar o token ', erro);
            return res.status(400).send({ erro: 'Erro interno do servidor' });
          });
      } else {
        return res.status(404).send({ erro: 'Usuário não encontrado' });
      }
    })
    .catch((erro) => {
      console.error('Erro ao recuperar senha', erro);
      return res.status(500).send({
        erro: 'Falha interna',
      });
    });
});

router.post('/trocar-senha', (req, res) => {
  const { email, token, novaSenha } = req.body;
  Usuario.findOne({ email })
    .select('+tokenDeTrocaDeSenha validadeTokenDeTrocaDeSenha')
    .then((usuario) => {
      if (usuario) {
        if (
          (token != usuario.tokenDeTrocaDeSenha) !=
          new Date().now > usuario.validadeTokenDeTrocaDeSenha
        ) {
          return res.status(400).send({ erro: 'Token inválido' });
        } else {
          usuario.tokenDeTrocaDeSenha = undefined;
          usuario.validadeTokenDeTrocaDeSenha = undefined;
          usuario.senha = novaSenha;

          usuario
            .save()
            .then(() => {
              return res.status(200).send({
                mensagem: 'Senha trocada com sucesso',
              });
            })
            .catch((erro) => {
              console.error('Erro ao trocar a senha do usuário', erro);
              return res.status(500).send({
                erro: 'Falha interna',
              });
            });
        }
      } else {
        return res.status(404).send({ erro: 'Usuário não encontrado' });
      }
    })
    .catch((erro) => {
      console.error('Erro ao buscar o usuário para trocar senha', erro);
      return res.status(500).send({
        erro: 'Falha interna',
      });
    });
});

export default router;
