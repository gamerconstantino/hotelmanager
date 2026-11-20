import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
const router = express.Router();
// LISTAR UTILIZADORES
router.get('/', async (req, res) => {
  try {
    const [utilizadores] = await db.query(
      `SELECT id, nome, email, perfil, estado, criado_em
       FROM utilizadores
       ORDER BY id DESC`
    );
    res.json(utilizadores);
  } catch (error) {
    console.error('Erro ao listar utilizadores:', error);
    res.status(500).json({
      message: 'Erro ao consultar utilizadores.'
    });
  }
});
// CRIAR UTILIZADOR
router.post('/', async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({
        message: 'Preencha todos os campos obrigatórios.'
      });
    }
    if (senha.length < 6) {
      return res.status(400).json({
        message: 'A palavra-passe deve ter pelo menos 6 caracteres.'
      });
    }
    if (!['Administrador', 'Recepcionista'].includes(perfil)) {
      return res.status(400).json({
        message: 'Perfil de utilizador inválido.'
      });
    }
    const emailNormalizado = email.trim().toLowerCase();
    const [existente] = await db.query(
      'SELECT id FROM utilizadores WHERE email = ?',
      [emailNormalizado]
    );
    if (existente.length > 0) {
      return res.status(409).json({
        message: 'Este email já está registado.'
      });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await db.query(
      `INSERT INTO utilizadores
       (nome, email, senha, perfil, estado)
       VALUES (?, ?, ?, ?, 'Ativo')`,
      [
        nome.trim(),
        emailNormalizado,
        senhaHash,
        perfil
      ]
    );
    res.status(201).json({
      message: 'Utilizador criado com sucesso!',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    res.status(500).json({
      message: 'Erro ao criar utilizador.'
    });
  }
});
// ATUALIZAR UTILIZADOR
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de utilizador inválido.'
      });
    }
    const { nome, email, senha, perfil, estado } = req.body;
    if (!nome || !email || !perfil || !estado) {
      return res.status(400).json({
        message: 'Preencha os campos obrigatórios.'
      });
    }
    if (!['Administrador', 'Recepcionista'].includes(perfil)) {
      return res.status(400).json({
        message: 'Perfil inválido.'
      });
    }
    if (!['Ativo', 'Inativo'].includes(estado)) {
      return res.status(400).json({
        message: 'Estado inválido.'
      });
    }
    if (senha && senha.length < 6) {
      return res.status(400).json({
        message: 'A palavra-passe deve ter pelo menos 6 caracteres.'
      });
    }
    const [utilizadores] = await db.query(
      'SELECT id FROM utilizadores WHERE id = ?',
      [id]
    );
    if (utilizadores.length === 0) {
      return res.status(404).json({
        message: 'Utilizador não encontrado.'
      });
    }
    // Impedir que o administrador desative ou rebaixe a própria conta
    if (Number(req.utilizador.id) === id) {
      if (estado === 'Inativo' || perfil !== 'Administrador') {
        return res.status(400).json({
          message: 'Não pode desativar ou retirar o seu próprio perfil de administrador.'
        });
      }
    }
    const emailNormalizado = email.trim().toLowerCase();
    const [emailExistente] = await db.query(
      'SELECT id FROM utilizadores WHERE email = ? AND id != ?',
      [emailNormalizado, id]
    );
    if (emailExistente.length > 0) {
      return res.status(409).json({
        message: 'Este email já pertence a outro utilizador.'
      });
    }
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      await db.query(
        `UPDATE utilizadores
         SET nome = ?, email = ?, senha = ?, perfil = ?, estado = ?
         WHERE id = ?`,
        [
          nome.trim(),
          emailNormalizado,
          senhaHash,
          perfil,
          estado,
          id
        ]
      );
    } else {
      await db.query(
        `UPDATE utilizadores
         SET nome = ?, email = ?, perfil = ?, estado = ?
         WHERE id = ?`,
        [
          nome.trim(),
          emailNormalizado,
          perfil,
          estado,
          id
        ]
      );
    }
    res.json({
      message: 'Utilizador atualizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    res.status(500).json({
      message: 'Erro ao atualizar utilizador.'
    });
  }
});
export default router;