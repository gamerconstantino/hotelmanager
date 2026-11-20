
export default function adminMiddleware(req, res, next) {
  if (!req.utilizador) {
    return res.status(401).json({
      message: 'Autenticação necessária.'
    });
  }
  if (req.utilizador.perfil !== 'Administrador') {
    return res.status(403).json({
      message: 'Acesso negado. Apenas administradores podem realizar esta operação.'
    });
  }
  next();
}