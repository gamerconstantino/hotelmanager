import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
console.log('Rota de autenticação carregada com sucesso!');


// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: 'Informe o email e a palavra-passe.'
      });
    }

    const [utilizadores] = await db.query(
      `SELECT id, nome, email, senha, perfil, estado
       FROM utilizadores
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (utilizadores.length === 0) {
      return res.status(401).json({
        message: 'Email ou palavra-passe incorretos.'
      });
    }

    const utilizador = utilizadores[0];

    if (utilizador.estado !== 'Ativo') {
      return res.status(403).json({
        message: 'Esta conta está inativa. Contacte o administrador.'
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      utilizador.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        message: 'Email ou palavra-passe incorretos.'
      });
    }

    const token = jwt.sign(
      {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        perfil: utilizador.perfil
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      utilizador: {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        perfil: utilizador.perfil
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);

    return res.status(500).json({
      message: 'Erro interno ao iniciar sessão.'
    });
  }
});

// CONSULTAR UTILIZADOR AUTENTICADO
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [utilizadores] = await db.query(
      `SELECT id, nome, email, perfil, estado
       FROM utilizadores
       WHERE id = ?
       LIMIT 1`,
      [req.utilizador.id]
    );

    if (utilizadores.length === 0 || utilizadores[0].estado !== 'Ativo') {
      return res.status(401).json({
        message: 'Utilizador não encontrado ou inativo.'
      });
    }

    return res.json({
      utilizador: utilizadores[0]
    });

  } catch (error) {
    console.error('Erro ao consultar sessão:', error);

    return res.status(500).json({
      message: 'Erro ao consultar utilizador.'
    });
  }
});

export default router;
