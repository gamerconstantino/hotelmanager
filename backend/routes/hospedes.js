
import express from 'express';
import db from '../db.js';

const router = express.Router();

// LISTAR E PESQUISAR HÓSPEDES
router.get('/', async (req, res) => {
  try {
    const pesquisa = (req.query.q || '').trim();

    const [hospedes] = await db.query(
      `SELECT * FROM hospedes
       WHERE nome_completo LIKE ?
          OR documento LIKE ?
          OR telefone LIKE ?
          OR email LIKE ?
       ORDER BY id DESC`,
      [
        `%${pesquisa}%`,
        `%${pesquisa}%`,
        `%${pesquisa}%`,
        `%${pesquisa}%`
      ]
    );

    return res.json(hospedes);
  } catch (error) {
    console.error('Erro ao listar hóspedes:', error);
    return res.status(500).json({
      message: 'Erro ao consultar hóspedes.'
    });
  }
});

// CONSULTAR UM HÓSPEDE PELO ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de hóspede inválido.'
      });
    }

    const [hospedes] = await db.query(
      'SELECT * FROM hospedes WHERE id = ? LIMIT 1',
      [id]
    );

    if (hospedes.length === 0) {
      return res.status(404).json({
        message: 'Hóspede não encontrado.'
      });
    }

    return res.json(hospedes[0]);
  } catch (error) {
    console.error('Erro ao consultar hóspede:', error);
    return res.status(500).json({
      message: 'Erro ao consultar hóspede.'
    });
  }
});

// CADASTRAR HÓSPEDE
router.post('/', async (req, res) => {
  try {
    const {
      nome_completo,
      documento,
      telefone,
      email,
      endereco
    } = req.body;

    if (
      !nome_completo?.trim() ||
      !documento?.trim() ||
      !telefone?.trim()
    ) {
      return res.status(400).json({
        message: 'Nome, documento e telefone são obrigatórios.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO hospedes
       (nome_completo, documento, telefone, email, endereco)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nome_completo.trim(),
        documento.trim(),
        telefone.trim(),
        email?.trim() || null,
        endereco?.trim() || null
      ]
    );

    return res.status(201).json({
      message: 'Hóspede cadastrado com sucesso!',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erro ao cadastrar hóspede:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Este documento já está cadastrado.'
      });
    }

    return res.status(500).json({
      message: 'Erro ao cadastrar hóspede.'
    });
  }
});

// ATUALIZAR HÓSPEDE
router.put('/:id', async (req, res) => {
  try {
    const {
      nome_completo,
      documento,
      telefone,
      email,
      endereco
    } = req.body;

    if (
      !nome_completo?.trim() ||
      !documento?.trim() ||
      !telefone?.trim()
    ) {
      return res.status(400).json({
        message: 'Nome, documento e telefone são obrigatórios.'
      });
    }

    const [result] = await db.query(
      `UPDATE hospedes
       SET nome_completo = ?,
           documento = ?,
           telefone = ?,
           email = ?,
           endereco = ?
       WHERE id = ?`,
      [
        nome_completo.trim(),
        documento.trim(),
        telefone.trim(),
        email?.trim() || null,
        endereco?.trim() || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Hóspede não encontrado.'
      });
    }

    return res.json({
      message: 'Hóspede atualizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar hóspede:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Este documento já pertence a outro hóspede.'
      });
    }

    return res.status(500).json({
      message: 'Erro ao atualizar hóspede.'
    });
  }
});

// ELIMINAR HÓSPEDE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM hospedes WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Hóspede não encontrado.'
      });
    }

    return res.json({
      message: 'Hóspede eliminado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao eliminar hóspede:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Não é possível eliminar este hóspede porque existem reservas associadas.'
      });
    }

    return res.status(500).json({
      message: 'Erro ao eliminar hóspede.'
    });
  }
});

export default router;
