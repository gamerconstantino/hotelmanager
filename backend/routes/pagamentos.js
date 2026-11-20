
import express from 'express';
import db from '../db.js';

const router = express.Router();

console.log('Rota de pagamentos carregada com sucesso!');

const metodos = ['Dinheiro', 'Multicaixa', 'Transferencia', 'Outro'];
const estados = ['Pendente', 'Pago', 'Estornado'];

// LISTAR PAGAMENTOS
router.get('/', async (req, res) => {
  try {
    const {
      q = '',
      estado = '',
      data_inicio = '',
      data_fim = ''
    } = req.query;

    let sql = `
      SELECT
        p.id,
        p.reserva_id,
        p.valor,
        p.metodo,
        p.estado,
        p.referencia,
        p.data_pagamento,
        h.nome_completo AS hospede,
        r.valor_total,
        COALESCE((
          SELECT SUM(p2.valor)
          FROM pagamentos p2
          WHERE p2.reserva_id = p.reserva_id
            AND p2.estado = 'Pago'
        ), 0) AS total_pago,
        COALESCE((
          SELECT SUM(p3.valor)
          FROM pagamentos p3
          WHERE p3.reserva_id = p.reserva_id
            AND p3.estado = 'Pendente'
        ), 0) AS total_pendente
      FROM pagamentos p
      INNER JOIN reservas r ON r.id = p.reserva_id
      INNER JOIN hospedes h ON h.id = r.hospede_id
      WHERE (
        h.nome_completo LIKE ?
        OR CAST(p.reserva_id AS CHAR) LIKE ?
        OR p.referencia LIKE ?
      )
    `;

    const parametros = [
      `%${q}%`,
      `%${q}%`,
      `%${q}%`
    ];

    if (estado && estados.includes(estado)) {
      sql += ' AND p.estado = ?';
      parametros.push(estado);
    }

    if (data_inicio) {
      sql += ' AND DATE(p.data_pagamento) >= ?';
      parametros.push(data_inicio);
    }

    if (data_fim) {
      sql += ' AND DATE(p.data_pagamento) <= ?';
      parametros.push(data_fim);
    }

    sql += ' ORDER BY p.id DESC';

    const [pagamentos] = await db.query(sql, parametros);

    return res.json(pagamentos);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);

    return res.status(500).json({
      message: 'Erro ao consultar pagamentos.'
    });
  }
});

// CARREGAR RESERVAS E SALDOS
router.get('/opcoes', async (req, res) => {
  try {
    const [reservas] = await db.query(`
      SELECT
        r.id,
        r.valor_total,
        r.estado AS estado_reserva,
        h.nome_completo AS hospede,
        q.numero AS numero_quarto,

        COALESCE((
          SELECT SUM(p.valor)
          FROM pagamentos p
          WHERE p.reserva_id = r.id
            AND p.estado = 'Pago'
        ), 0) AS total_pago,

        COALESCE((
          SELECT SUM(p.valor)
          FROM pagamentos p
          WHERE p.reserva_id = r.id
            AND p.estado = 'Pendente'
        ), 0) AS total_pendente

      FROM reservas r
      INNER JOIN hospedes h ON h.id = r.hospede_id
      INNER JOIN quartos q ON q.id = r.quarto_id
      WHERE r.estado <> 'Cancelada'
      ORDER BY r.id DESC
    `);

    const resultado = reservas.map((r) => {
      const totalReserva = Number(r.valor_total || 0);
      const totalPago = Number(r.total_pago || 0);
      const totalPendente = Number(r.total_pendente || 0);

      return {
        ...r,
        valor_total: totalReserva,
        total_pago: totalPago,
        total_pendente: totalPendente,
        saldo: Math.max(
          0,
          totalReserva - totalPago - totalPendente
        )
      };
    });

    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao carregar reservas:', error);

    return res.status(500).json({
      message: 'Erro ao carregar reservas para pagamento.'
    });
  }
});

// REGISTAR PAGAMENTO
router.post('/', async (req, res) => {
  let conexao;
  let transacaoIniciada = false;

  try {
    const {
      reserva_id,
      valor,
      metodo,
      estado = 'Pago',
      referencia
    } = req.body;

    const reservaId = Number(reserva_id);
    const valorNumerico = Number(valor);

    if (
      !Number.isInteger(reservaId) ||
      reservaId <= 0 ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0 ||
      !metodo
    ) {
      return res.status(400).json({
        message: 'Informe uma reserva, um valor válido e o método de pagamento.'
      });
    }

    if (!metodos.includes(metodo)) {
      return res.status(400).json({
        message: 'Método de pagamento inválido.'
      });
    }

    if (!['Pago', 'Pendente'].includes(estado)) {
      return res.status(400).json({
        message: 'O pagamento deve ser registado como Pago ou Pendente.'
      });
    }

    conexao = await db.getConnection();
    await conexao.beginTransaction();
    transacaoIniciada = true;

    const [reservas] = await conexao.query(
      `SELECT id, valor_total, estado
       FROM reservas
       WHERE id = ?
       FOR UPDATE`,
      [reservaId]
    );

    if (reservas.length === 0) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(404).json({
        message: 'Reserva não encontrada.'
      });
    }

    const reserva = reservas[0];

    if (reserva.estado === 'Cancelada') {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(400).json({
        message: 'Não é possível registar pagamentos numa reserva cancelada.'
      });
    }

    const [saldos] = await conexao.query(
      `SELECT COALESCE(SUM(valor), 0) AS total
       FROM pagamentos
       WHERE reserva_id = ?
         AND estado IN ('Pago', 'Pendente')`,
      [reservaId]
    );

    const totalComprometido = Number(saldos[0].total);
    const totalReserva = Number(reserva.valor_total);

    if (totalComprometido + valorNumerico > totalReserva + 0.001) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(409).json({
        message: 'O valor ultrapassa o saldo disponível da reserva.'
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO pagamentos
       (reserva_id, valor, metodo, estado, referencia)
       VALUES (?, ?, ?, ?, ?)`,
      [
        reservaId,
        valorNumerico,
        metodo,
        estado,
        referencia?.trim() || null
      ]
    );

    await conexao.commit();
    transacaoIniciada = false;

    return res.status(201).json({
      message: 'Pagamento registado com sucesso!',
      id: resultado.insertId
    });
  } catch (error) {
    if (conexao && transacaoIniciada) {
      await conexao.rollback();
    }

    console.error('Erro ao registar pagamento:', error);

    return res.status(500).json({
      message: 'Erro ao registar pagamento.'
    });
  } finally {
    if (conexao) conexao.release();
  }
});

// CONFIRMAR PAGAMENTO PENDENTE
router.patch('/:id/confirmar', async (req, res) => {
  let conexao;
  let transacaoIniciada = false;

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de pagamento inválido.'
      });
    }

    conexao = await db.getConnection();
    await conexao.beginTransaction();
    transacaoIniciada = true;

    const [pagamentos] = await conexao.query(
      `SELECT id, reserva_id, valor, estado
       FROM pagamentos
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (pagamentos.length === 0) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(404).json({
        message: 'Pagamento não encontrado.'
      });
    }

    const pagamento = pagamentos[0];

    if (pagamento.estado !== 'Pendente') {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(400).json({
        message: 'Este pagamento não está pendente.'
      });
    }

    const [reservas] = await conexao.query(
      `SELECT id, valor_total, estado
       FROM reservas
       WHERE id = ?
       FOR UPDATE`,
      [pagamento.reserva_id]
    );

    if (reservas.length === 0 || reservas[0].estado === 'Cancelada') {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(400).json({
        message: 'A reserva não está disponível para confirmar o pagamento.'
      });
    }

    const [saldos] = await conexao.query(
      `SELECT COALESCE(SUM(valor), 0) AS total
       FROM pagamentos
       WHERE reserva_id = ?
         AND estado = 'Pago'`,
      [pagamento.reserva_id]
    );

    const totalPago = Number(saldos[0].total);
    const totalReserva = Number(reservas[0].valor_total);

    if (totalPago + Number(pagamento.valor) > totalReserva + 0.001) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(409).json({
        message: 'Não é possível confirmar: o valor ultrapassa o saldo da reserva.'
      });
    }

    await conexao.query(
      `UPDATE pagamentos
       SET estado = 'Pago'
       WHERE id = ?`,
      [id]
    );

    await conexao.commit();
    transacaoIniciada = false;

    return res.json({
      message: 'Pagamento confirmado com sucesso!'
    });
  } catch (error) {
    if (conexao && transacaoIniciada) {
      await conexao.rollback();
    }

    console.error('Erro ao confirmar pagamento:', error);

    return res.status(500).json({
      message: 'Erro ao confirmar pagamento.'
    });
  } finally {
    if (conexao) conexao.release();
  }
});

// ESTORNAR PAGAMENTO
router.patch('/:id/estornar', async (req, res) => {
  let conexao;
  let transacaoIniciada = false;

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de pagamento inválido.'
      });
    }

    conexao = await db.getConnection();
    await conexao.beginTransaction();
    transacaoIniciada = true;

    const [pagamentos] = await conexao.query(
      `SELECT id, estado
       FROM pagamentos
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (pagamentos.length === 0) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(404).json({
        message: 'Pagamento não encontrado.'
      });
    }

    if (pagamentos[0].estado !== 'Pago') {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(400).json({
        message: 'Só é possível estornar pagamentos que estejam pagos.'
      });
    }

    await conexao.query(
      `UPDATE pagamentos
       SET estado = 'Estornado'
       WHERE id = ?`,
      [id]
    );

    await conexao.commit();
    transacaoIniciada = false;

    return res.json({
      message: 'Pagamento estornado com sucesso!'
    });
  } catch (error) {
    if (conexao && transacaoIniciada) {
      await conexao.rollback();
    }

    console.error('Erro ao estornar pagamento:', error);

    return res.status(500).json({
      message: 'Erro ao estornar pagamento.'
    });
  } finally {
    if (conexao) conexao.release();
  }
});

export default router;
