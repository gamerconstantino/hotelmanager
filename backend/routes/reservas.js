import express from 'express';
import db from '../db.js';

const router = express.Router();
console.log('Rota de reservas carregada com sucesso!');

const estados = [
  'Pendente',
  'Confirmada',
  'Em andamento',
  'Concluida',
  'Cancelada'
];

function calcularNoites(checkin, checkout) {
  const inicio = new Date(`${checkin}T00:00:00Z`);
  const fim = new Date(`${checkout}T00:00:00Z`);

  return Math.round((fim - inicio) / 86400000);
}

// VERIFICAR DISPONIBILIDADE DO QUARTO
async function verificarDisponibilidade(
  conexao,
  quartoId,
  checkin,
  checkout,
  reservaId = null
) {
  const [quartos] = await conexao.query(
    'SELECT id, capacidade, preco_diaria, estado FROM quartos WHERE id = ?',
    [quartoId]
  );

  if (quartos.length === 0) {
    throw new Error('Quarto não encontrado.');
  }

  if (quartos[0].estado === 'Manutencao') {
    throw new Error('Este quarto está em manutenção.');
  }

  let sql = `
    SELECT id FROM reservas
    WHERE quarto_id = ?
      AND estado != 'Cancelada'
      AND data_checkin < ?
      AND data_checkout > ?
  `;

  const parametros = [quartoId, checkout, checkin];

  if (reservaId) {
    sql += ' AND id != ?';
    parametros.push(reservaId);
  }

  const [conflitos] = await conexao.query(sql, parametros);

  if (conflitos.length > 0) {
    throw new Error(
      'Este quarto já possui uma reserva para as datas selecionadas.'
    );
  }

  return quartos[0];
}

// LISTAR RESERVAS
router.get('/', async (req, res) => {
  try {
    const pesquisa = (req.query.q || '').trim();
    const estado = (req.query.estado || '').trim();

    let sql = `
      SELECT
        r.id,
        r.hospede_id,
        r.quarto_id,
        r.funcionario_id,
        DATE_FORMAT(r.data_checkin, '%Y-%m-%d') AS data_checkin,
        DATE_FORMAT(r.data_checkout, '%Y-%m-%d') AS data_checkout,
        r.numero_hospedes,
        r.valor_total,
        r.estado,
        r.observacoes,
        h.nome_completo,
        h.telefone,
        h.documento,
        q.numero AS numero_quarto,
        q.tipo AS tipo_quarto
      FROM reservas r
      INNER JOIN hospedes h ON h.id = r.hospede_id
      INNER JOIN quartos q ON q.id = r.quarto_id
      WHERE (
        h.nome_completo LIKE ?
        OR q.numero LIKE ?
        OR h.documento LIKE ?
      )
    `;

    const parametros = [
      `%${pesquisa}%`,
      `%${pesquisa}%`,
      `%${pesquisa}%`
    ];

    if (estado && estados.includes(estado)) {
      sql += ' AND r.estado = ?';
      parametros.push(estado);
    }

    sql += ' ORDER BY r.id DESC';

    const [reservas] = await db.query(sql, parametros);

    res.json(reservas);

  } catch (error) {
    console.error('Erro ao listar reservas:', error);

    res.status(500).json({
      message: 'Erro ao consultar reservas.'
    });
  }
});

// OPÇÕES PARA O FORMULÁRIO
router.get('/opcoes', async (req, res) => {
  try {
    const [hospedes] = await db.query(`
      SELECT id, nome_completo, documento
      FROM hospedes
      ORDER BY nome_completo ASC
    `);

    const [quartos] = await db.query(`
      SELECT id, numero, tipo, capacidade, preco_diaria, estado
      FROM quartos
      WHERE estado != 'Manutencao'
      ORDER BY numero ASC
    `);

    res.json({ hospedes, quartos });

  } catch (error) {
    console.error('Erro ao carregar opções:', error);

    res.status(500).json({
      message: 'Erro ao carregar hóspedes e quartos.'
    });
  }
});

// CRIAR RESERVA
router.post('/', async (req, res) => {
  const conexao = await db.getConnection();

  try {
    const {
      hospede_id,
      quarto_id,
      data_checkin,
      data_checkout,
      numero_hospedes,
      observacoes
    } = req.body;

    if (
      !hospede_id ||
      !quarto_id ||
      !data_checkin ||
      !data_checkout ||
      !numero_hospedes
    ) {
      return res.status(400).json({
        message: 'Preencha todos os campos obrigatórios.'
      });
    }

    const noites = calcularNoites(data_checkin, data_checkout);

    if (noites <= 0 || !Number.isFinite(noites)) {
      return res.status(400).json({
        message: 'A data de saída deve ser posterior à data de entrada.'
      });
    }

    if (!Number.isInteger(Number(numero_hospedes)) ||
        Number(numero_hospedes) < 1) {
      return res.status(400).json({
        message: 'Número de hóspedes inválido.'
      });
    }

    await conexao.beginTransaction();

    const quarto = await verificarDisponibilidade(
      conexao,
      quarto_id,
      data_checkin,
      data_checkout
    );

    if (Number(numero_hospedes) > quarto.capacidade) {
      throw new Error(
        `Este quarto permite no máximo ${quarto.capacidade} hóspedes.`
      );
    }

    const [hospedes] = await conexao.query(
      'SELECT id FROM hospedes WHERE id = ?',
      [hospede_id]
    );

    if (hospedes.length === 0) {
      throw new Error('Hóspede não encontrado.');
    }

    const valorTotal = Number(quarto.preco_diaria) * noites;

    const [resultado] = await conexao.query(
      `INSERT INTO reservas
      (hospede_id, quarto_id, data_checkin, data_checkout,
       numero_hospedes, valor_total, estado, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, 'Pendente', ?)`,
      [
        hospede_id,
        quarto_id,
        data_checkin,
        data_checkout,
        numero_hospedes,
        valorTotal,
        observacoes?.trim() || null
      ]
    );

    await conexao.commit();

    res.status(201).json({
      message: 'Reserva criada com sucesso!',
      id: resultado.insertId,
      valor_total: valorTotal,
      noites
    });

  } catch (error) {
    await conexao.rollback();

    console.error('Erro ao criar reserva:', error);

    res.status(400).json({
      message: error.message || 'Erro ao criar reserva.'
    });

  } finally {
    conexao.release();
  }
});

// ATUALIZAR RESERVA
router.put('/:id', async (req, res) => {
  const conexao = await db.getConnection();

  try {
    const {
      hospede_id,
      quarto_id,
      data_checkin,
      data_checkout,
      numero_hospedes,
      estado,
      observacoes
    } = req.body;

    if (
      !hospede_id ||
      !quarto_id ||
      !data_checkin ||
      !data_checkout ||
      !numero_hospedes ||
      !estados.includes(estado)
    ) {
      return res.status(400).json({
        message: 'Verifique os campos obrigatórios da reserva.'
      });
    }

    const noites = calcularNoites(data_checkin, data_checkout);

    if (noites <= 0 || !Number.isFinite(noites)) {
      return res.status(400).json({
        message: 'A data de saída deve ser posterior à entrada.'
      });
    }

    if (!Number.isInteger(Number(numero_hospedes)) ||
        Number(numero_hospedes) < 1) {
      return res.status(400).json({
        message: 'Número de hóspedes inválido.'
      });
    }

    await conexao.beginTransaction();

    const [reservas] = await conexao.query(
      'SELECT id FROM reservas WHERE id = ?',
      [req.params.id]
    );

    if (reservas.length === 0) {
      throw new Error('Reserva não encontrada.');
    }

    const [hospedes] = await conexao.query(
      'SELECT id FROM hospedes WHERE id = ?',
      [hospede_id]
    );

    if (hospedes.length === 0) {
      throw new Error('Hóspede não encontrado.');
    }

    let valorTotal = 0;

    if (estado !== 'Cancelada') {
      const quarto = await verificarDisponibilidade(
        conexao,
        quarto_id,
        data_checkin,
        data_checkout,
        req.params.id
      );

      if (Number(numero_hospedes) > quarto.capacidade) {
        throw new Error(
          `Este quarto permite no máximo ${quarto.capacidade} hóspedes.`
        );
      }

      valorTotal = Number(quarto.preco_diaria) * noites;
    } else {
      const [quartos] = await conexao.query(
        'SELECT preco_diaria FROM quartos WHERE id = ?',
        [quarto_id]
      );

      if (quartos.length === 0) {
        throw new Error('Quarto não encontrado.');
      }

      valorTotal = Number(quartos[0].preco_diaria) * noites;
    }

    await conexao.query(
      `UPDATE reservas SET
        hospede_id = ?,
        quarto_id = ?,
        data_checkin = ?,
        data_checkout = ?,
        numero_hospedes = ?,
        valor_total = ?,
        estado = ?,
        observacoes = ?
      WHERE id = ?`,
      [
        hospede_id,
        quarto_id,
        data_checkin,
        data_checkout,
        numero_hospedes,
        valorTotal,
        estado,
        observacoes?.trim() || null,
        req.params.id
      ]
    );

    await conexao.commit();

    res.json({
      message: 'Reserva atualizada com sucesso!',
      valor_total: valorTotal
    });

  } catch (error) {
    await conexao.rollback();

    console.error('Erro ao atualizar reserva:', error);

    res.status(400).json({
      message: error.message || 'Erro ao atualizar reserva.'
    });

  } finally {
    conexao.release();
  }
});

// CANCELAR RESERVA SEM APAGAR O HISTÓRICO
router.patch('/:id/cancelar', async (req, res) => {
  try {
    const [resultado] = await db.query(
      `UPDATE reservas
       SET estado = 'Cancelada'
       WHERE id = ? AND estado != 'Cancelada'`,
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Reserva não encontrada ou já cancelada.'
      });
    }

    res.json({
      message: 'Reserva cancelada com sucesso!'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Erro ao cancelar reserva.'
    });
  }
});

export default router;