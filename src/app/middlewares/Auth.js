import jwt from 'jsonwebtoken';
import authConfig from '@/config/auth';

export default (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const tokenData = authHeader.split(' ');

    if (tokenData.length !== 2) {
      return res.status(401).send({ erro: 'Token inválido' });
    }

    const [schema, token] = tokenData;
    if (schema.indexOf('Bearer') < 0) {
      return res.status(401).send({ erro: 'Token inválido' });
    }

    jwt.verify(token, authConfig.secret, (erro, decodificado) => {
      if (erro) {
        return res.status(401).send({ erro: 'Token inválido' });
      } else {
        req.uid = decodificado.uid;
        return next();
      }
    });
  } else {
    return res.status(401).send({ erro: 'Token inválido' });
  }
};
