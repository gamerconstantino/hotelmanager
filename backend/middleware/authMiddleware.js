
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function authMiddleware(req, res, next) {
  try {
    const autorizacao = req.headers.authorization;

    if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Acesso não autorizado. Inicie a sessão.'
      });
    }

    const token = autorizacao.split(' ')[1];

    const utilizador = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.utilizador = utilizador;

    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Sessão inválida ou expirada. Inicie novamente a sessão.'
    });
  }
}

export default authMiddleware;
