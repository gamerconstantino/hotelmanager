
import express from 'express';
import db from '../db.js';

const router = express.Router();

console.log('Rotas de Check-in e Check-out carregadas com sucesso!');

// CHECK-IN
router.patch('/:id/checkin', async (req, res) => {
  const { id } = req.params;

  let conexao;

  try {
    conexao = await db.getConnection();
    await conexao.beginTransaction();

    const [reservas] = await conexao.query(
      `SELECT id, quarto_id, estado
       FROM reservas
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (reservas.length === 0) {
      await conexao.rollback();
      return res.status(404).json({
        message: 'Reserva não encontrada.'
      });
    }

    const reserva = reservas[0];

    if (reserva.estado !== 'Confirmada') {
      await conexao.rollback();
      return res.status(400).json({
        message: 'Apenas reservas confirmadas podem realizar check-in.'
      });
    }

    const [quartos] = await conexao.query(
      `SELECT id, estado
       FROM quartos
       WHERE id = ?
       FOR UPDATE`,
      [reserva.quarto_id]
    );

    if (quartos.length === 0) {
      await conexao.rollback();
      return res.status(404).json({
        message: 'Quarto não encontrado.'
      });
    }

    if (quartos[0].estado !== 'Disponivel') {
      await conexao.rollback();
      return res.status(400).json({
        message: 'O quarto não está disponível.'
      });
    }

    await conexao.query(
      `UPDATE reservas
       SET estado = 'Em andamento'
       WHERE id = ?`,
      [id]
    );

    await conexao.query(
      `UPDATE quartos
       SET estado = 'Ocupado'
       WHERE id = ?`,
      [reserva.quarto_id]
    );

    await conexao.commit();

    return res.json({
      message: 'Check-in realizado com sucesso.',
      reserva_id: Number(id),
      estado: 'Em andamento'
    });

  } catch (error) {
    if (conexao) await conexao.rollback();

    console.error('Erro no check-in:', error);

    return res.status(500).json({
      message: 'Erro interno ao realizar check-in.',
      detalhe: error.message
    });

  } finally {
    if (conexao) conexao.release();
  }
});

// CHECK-OUT
router.patch('/:id/checkout', async (req, res) => {
  const { id } = req.params;

  let conexao;

  try {
    conexao = await db.getConnection();
    await conexao.beginTransaction();

    const [reservas] = await conexao.query(
      `SELECT id, quarto_id, estado
       FROM reservas
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (reservas.length === 0) {
      await conexao.rollback();
      return res.status(404).json({
        message: 'Reserva não encontrada.'
      });
    }

    const reserva = reservas[0];

    if (reserva.estado !== 'Em andamento') {
      await conexao.rollback();
      return res.status(400).json({
        message: 'Apenas reservas em andamento podem realizar check-out.'
      });
    }

    await conexao.query(
      `UPDATE reservas
       SET estado = 'Concluida'
       WHERE id = ?`,
      [id]
    );

    const [outrasReservas] = await conexao.query(
      `SELECT id
       FROM reservas
       WHERE quarto_id = ?
       AND estado = 'Em andamento'
       AND id <> ?`,
      [reserva.quarto_id, id]
    );

    if (outrasReservas.length === 0) {
      await conexao.query(
        `UPDATE quartos
         SET estado = 'Disponivel'
         WHERE id = ?`,
        [reserva.quarto_id]
      );
    }

    await conexao.commit();

    return res.json({
      message: 'Check-out realizado com sucesso.',
      reserva_id: Number(id),
      estado: 'Concluida'
    });

  } catch (error) {
    if (conexao) await conexao.rollback();

    console.error('Erro no check-out:', error);

    return res.status(500).json({
      message: 'Erro interno ao realizar check-out.',
      detalhe: error.message
    });

  } finally {
    if (conexao) conexao.release();
  }
});

export default router;
