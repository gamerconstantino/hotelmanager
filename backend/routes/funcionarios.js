import express from 'express';
import db from '../db.js';

const router = express.Router();

const estadosPermitidos = ['Ativo', 'Inativo'];

// LISTAR E PESQUISAR FUNCIONÁRIOS
router.get('/', async (req, res) => {
  try {
    const pesquisa = (req.query.q || '').trim();

    const [funcionarios] = await db.query(
      `SELECT id, nome_completo, telefone, email, cargo, estado, created_at
       FROM funcionarios
       WHERE nome_completo LIKE ?
          OR telefone LIKE ?
          OR cargo LIKE ?
       ORDER BY id DESC`,
      [`%${pesquisa}%`, `%${pesquisa}%`, `%${pesquisa}%`]
    );

    res.json(funcionarios);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({
      message: 'Erro ao consultar funcionários.'
    });
  }
});

// CADASTRAR FUNCIONÁRIO
router.post('/', async (req, res) => {
  try {
    const {
      nome_completo,
      telefone,
      email,
      cargo,
      estado
    } = req.body;

    if (!nome_completo?.trim() || !telefone?.trim() || !cargo?.trim()) {
      return res.status(400).json({
        message: 'Preencha o nome, telefone e cargo.'
      });
    }

    const estadoFinal = estado || 'Ativo';

    if (!estadosPermitidos.includes(estadoFinal)) {
      return res.status(400).json({
        message: 'Estado inválido.'
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO funcionarios
       (nome_completo, telefone, email, cargo, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nome_completo.trim(),
        telefone.trim(),
        email?.trim() || null,
        cargo.trim(),
        estadoFinal
      ]
    );

    res.status(201).json({
      message: 'Funcionário cadastrado com sucesso!',
      id: resultado.insertId
    });

  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    res.status(500).json({
      message: 'Erro ao cadastrar funcionário.'
    });
  }
});

// ATUALIZAR FUNCIONÁRIO
router.put('/:id', async (req, res) => {
  try {
    const {
      nome_completo,
      telefone,
      email,
      cargo,
      estado
    } = req.body;

    if (
      !nome_completo?.trim() ||
      !telefone?.trim() ||
      !cargo?.trim() ||
      !estadosPermitidos.includes(estado)
    ) {
      return res.status(400).json({
        message: 'Verifique os campos obrigatórios.'
      });
    }

    const [resultado] = await db.query(
      `UPDATE funcionarios SET
       nome_completo = ?,
       telefone = ?,
       email = ?,
       cargo = ?,
       estado = ?
       WHERE id = ?`,
      [
        nome_completo.trim(),
        telefone.trim(),
        email?.trim() || null,
        cargo.trim(),
        estado,
        req.params.id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Funcionário não encontrado.'
      });
    }

    res.json({
      message: 'Funcionário atualizado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({
      message: 'Erro ao atualizar funcionário.'
    });
  }
});

// ELIMINAR FUNCIONÁRIO
router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await db.query(
      'DELETE FROM funcionarios WHERE id = ?',
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Funcionário não encontrado.'
      });
    }

    res.json({
      message: 'Funcionário eliminado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao eliminar funcionário:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Este funcionário está associado a reservas e não pode ser eliminado.'
      });
    }

    res.status(500).json({
      message: 'Erro ao eliminar funcionário.'
    });
  }
});

export default router;
