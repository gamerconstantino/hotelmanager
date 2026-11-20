
import express from 'express';
import db from '../db.js';

const router = express.Router();

// LISTAR TODOS OS QUARTOS
router.get('/', async (req, res) => {
  try {
    const [quartos] = await db.query(
      'SELECT * FROM quartos ORDER BY numero ASC'
    );

    res.json(quartos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erro ao consultar quartos.'
    });
  }
});

// CADASTRAR QUARTO
router.post('/', async (req, res) => {
  try {
    const {
      numero,
      tipo,
      capacidade,
      preco_diaria,
      estado,
      descricao
    } = req.body;

    if (!numero || !tipo || !preco_diaria) {
      return res.status(400).json({
        message: 'Número, tipo e preço são obrigatórios.'
      });
    }

    if (!['Individual', 'Duplo', 'Casal', 'Suite'].includes(tipo)) {
      return res.status(400).json({
        message: 'Tipo de quarto inválido.'
      });
    }

    if (!Number.isInteger(Number(capacidade)) || Number(capacidade) < 1) {
      return res.status(400).json({
        message: 'Capacidade inválida.'
      });
    }

    if (!Number.isFinite(Number(preco_diaria)) || Number(preco_diaria) <= 0) {
      return res.status(400).json({
        message: 'Preço diário inválido.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO quartos
       (numero, tipo, capacidade, preco_diaria, estado, descricao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        numero,
        tipo,
        Number(capacidade),
        Number(preco_diaria),
        estado || 'Disponivel',
        descricao || null
      ]
    );

    res.status(201).json({
      message: 'Quarto cadastrado com sucesso!',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Erro ao cadastrar quarto.'
    });
  }
});

// EDITAR QUARTO
router.put('/:id', async (req, res) => {
  try {
    const {
      numero,
      tipo,
      capacidade,
      preco_diaria,
      estado,
      descricao
    } = req.body;

    const [result] = await db.query(
      `UPDATE quartos
       SET numero = ?, tipo = ?, capacidade = ?,
           preco_diaria = ?, estado = ?, descricao = ?
       WHERE id = ?`,
      [
        numero,
        tipo,
        capacidade,
        preco_diaria,
        estado,
        descricao || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Quarto não encontrado.'
      });
    }

    res.json({
      message: 'Quarto atualizado com sucesso!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erro ao atualizar quarto.'
    });
  }
});

// ELIMINAR QUARTO
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM quartos WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Quarto não encontrado.'
      });
    }

    res.json({
      message: 'Quarto eliminado com sucesso!'
    });
  } catch (error) {
    console.error(error);

    res.status(409).json({
      message: 'Não foi possível eliminar o quarto. Verifique se existem reservas associadas.'
    });
  }
});

export default router;