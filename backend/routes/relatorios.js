
import express from 'express';
import db from '../db.js';

const router = express.Router();

console.log('Rota de relatórios carregada com sucesso!');

// ======================================================
// DASHBOARD GERAL
// GET /api/relatorios/dashboard
// ======================================================

router.get('/dashboard', async (req, res) => {
  try {
    const {
      periodo = '7dias',
      data_inicio = '',
      data_fim = ''
    } = req.query;

    let filtroPagamentos = '';
    let filtroReservas = '';
    let parametrosPagamentos = [];
    let parametrosReservas = [];

    // Filtros de período
    if (periodo === 'hoje') {
      filtroPagamentos = 'AND DATE(p.data_pagamento) = CURDATE()';
      filtroReservas = 'AND DATE(r.data_checkin) = CURDATE()';
    } else if (periodo === '7dias') {
      filtroPagamentos = `
        AND p.data_pagamento >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND p.data_pagamento < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `;

      filtroReservas = `
        AND r.data_checkin >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND r.data_checkin < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `;
    } else if (periodo === '30dias') {
      filtroPagamentos = `
        AND p.data_pagamento >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
        AND p.data_pagamento < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `;

      filtroReservas = `
        AND r.data_checkin >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
        AND r.data_checkin < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `;
    } else if (periodo === 'personalizado') {
      if (!data_inicio || !data_fim) {
        return res.status(400).json({
          message: 'Informe a data de início e a data de fim.'
        });
      }

      const formatoData = /^\d{4}-\d{2}-\d{2}$/;

      if (!formatoData.test(data_inicio) || !formatoData.test(data_fim)) {
        return res.status(400).json({
          message: 'Formato de data inválido. Utilize AAAA-MM-DD.'
        });
      }

      if (data_inicio > data_fim) {
        return res.status(400).json({
          message: 'A data inicial não pode ser posterior à data final.'
        });
      }

      filtroPagamentos = `
        AND DATE(p.data_pagamento) BETWEEN ? AND ?
      `;

      filtroReservas = `
        AND DATE(r.data_checkin) BETWEEN ? AND ?
      `;

      parametrosPagamentos = [data_inicio, data_fim];
      parametrosReservas = [data_inicio, data_fim];
    }

    // 1. QUARTOS
    const [quartosRows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(estado = 'Disponivel') AS disponiveis,
        SUM(estado = 'Ocupado') AS ocupados,
        SUM(estado = 'Manutencao') AS manutencao
      FROM quartos
    `);

    const quartos = quartosRows[0];

    // 2. HÓSPEDES
    const [hospedesRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM hospedes
    `);

    // 3. RESERVAS POR ESTADO E PERÍODO
    const [reservasRows] = await db.query(
      `
        SELECT
          r.estado,
          COUNT(*) AS quantidade
        FROM reservas r
        WHERE 1 = 1
        ${filtroReservas}
        GROUP BY r.estado
      `,
      parametrosReservas
    );

    const totalReservas = reservasRows.reduce(
      (total, reserva) => total + Number(reserva.quantidade || 0),
      0
    );

    // 4. PAGAMENTOS E RESUMO FINANCEIRO
    const [pagamentosRows] = await db.query(
      `
        SELECT
          p.estado,
          COALESCE(SUM(p.valor), 0) AS total
        FROM pagamentos p
        WHERE 1 = 1
        ${filtroPagamentos}
        GROUP BY p.estado
      `,
      parametrosPagamentos
    );

    const financeiro = {
      recebido: 0,
      pendente: 0,
      estornado: 0
    };

    pagamentosRows.forEach((pagamento) => {
      const valor = Number(pagamento.total || 0);

      if (pagamento.estado === 'Pago') {
        financeiro.recebido += valor;
      } else if (pagamento.estado === 'Pendente') {
        financeiro.pendente += valor;
      } else if (pagamento.estado === 'Estornado') {
        financeiro.estornado += valor;
      }
    });

    // 5. OCUPAÇÃO ATUAL
    const totalQuartos = Number(quartos.total || 0);
    const ocupados = Number(quartos.ocupados || 0);
    const manutencao = Number(quartos.manutencao || 0);
    const quartosOperacionais = Math.max(0, totalQuartos - manutencao);

    const percentualOcupacao = quartosOperacionais > 0
      ? Math.round((ocupados / quartosOperacionais) * 100)
      : 0;

    // 6. RECEITAS DIÁRIAS
    const [receitasRows] = await db.query(
      `
        SELECT
          DATE(p.data_pagamento) AS data,
          COALESCE(SUM(p.valor), 0) AS total
        FROM pagamentos p
        WHERE p.estado = 'Pago'
        ${filtroPagamentos}
        GROUP BY DATE(p.data_pagamento)
        ORDER BY DATE(p.data_pagamento) ASC
      `,
      parametrosPagamentos
    );

    // 7. RESPOSTA DO DASHBOARD
    res.json({
      periodo,

      quartos: {
        total: totalQuartos,
        disponiveis: Number(quartos.disponiveis || 0),
        ocupados,
        manutencao
      },

      hospedes: {
        total: Number(hospedesRows[0].total || 0)
      },

      reservas: {
        total: totalReservas,
        por_estado: reservasRows
      },

      financeiro,

      ocupacao: {
        percentual: percentualOcupacao,
        quartos_operacionais: quartosOperacionais
      },

      receitas_diarias: receitasRows.map((item) => ({
        data: item.data,
        total: Number(item.total || 0)
      })),

      reservas_por_estado: reservasRows.map((item) => ({
        estado: item.estado,
        quantidade: Number(item.quantidade || 0)
      }))
    });

  } catch (erro) {
    console.error('Erro no Dashboard:', erro);

    res.status(500).json({
      message: 'Erro ao carregar os dados do Dashboard.',
      erro: erro.message
    });
  }
});

// ======================================================
// RELATÓRIO GERAL
// GET /api/relatorios/resumo
// ======================================================

router.get('/resumo', async (req, res) => {
  try {
    const {
      data_inicio = '',
      data_fim = ''
    } = req.query;

    let filtroPagamentos = '';
    let filtroReservas = '';
    let parametros = [];

    if (data_inicio && data_fim) {
      const formatoData = /^\d{4}-\d{2}-\d{2}$/;

      if (!formatoData.test(data_inicio) || !formatoData.test(data_fim)) {
        return res.status(400).json({
          message: 'Formato de data inválido. Utilize AAAA-MM-DD.'
        });
      }

      if (data_inicio > data_fim) {
        return res.status(400).json({
          message: 'A data inicial não pode ser posterior à data final.'
        });
      }

      filtroPagamentos = `
        AND DATE(p.data_pagamento) BETWEEN ? AND ?
      `;

      filtroReservas = `
        AND DATE(r.data_checkin) BETWEEN ? AND ?
      `;

      parametros = [data_inicio, data_fim];
    }

    // Total de reservas no período
    const [reservasRows] = await db.query(
      `
        SELECT
          COUNT(*) AS total
        FROM reservas r
        WHERE 1 = 1
        ${filtroReservas}
      `,
      parametros
    );

    // Total de pagamentos no período
    const [pagamentosRows] = await db.query(
      `
        SELECT
          COALESCE(SUM(CASE
            WHEN p.estado = 'Pago' THEN p.valor
            ELSE 0
          END), 0) AS recebido,

          COALESCE(SUM(CASE
            WHEN p.estado = 'Pendente' THEN p.valor
            ELSE 0
          END), 0) AS pendente,

          COALESCE(SUM(CASE
            WHEN p.estado = 'Estornado' THEN p.valor
            ELSE 0
          END), 0) AS estornado

        FROM pagamentos p
        WHERE 1 = 1
        ${filtroPagamentos}
      `,
      parametros
    );

    // Reservas agrupadas por estado
    const [estadosRows] = await db.query(
      `
        SELECT
          r.estado,
          COUNT(*) AS quantidade
        FROM reservas r
        WHERE 1 = 1
        ${filtroReservas}
        GROUP BY r.estado
      `,
      parametros
    );

    res.json({
      periodo: {
        data_inicio: data_inicio || null,
        data_fim: data_fim || null
      },

      reservas: {
        total: Number(reservasRows[0].total || 0),
        por_estado: estadosRows.map((item) => ({
          estado: item.estado,
          quantidade: Number(item.quantidade || 0)
        }))
      },

      financeiro: {
        recebido: Number(pagamentosRows[0].recebido || 0),
        pendente: Number(pagamentosRows[0].pendente || 0),
        estornado: Number(pagamentosRows[0].estornado || 0)
      }
    });

  } catch (erro) {
    console.error('Erro no relatório geral:', erro);

    res.status(500).json({
      message: 'Erro ao gerar o relatório geral.',
      erro: erro.message
    });
  }
});

// ======================================================
// EXPORTAÇÃO PADRÃO — NECESSÁRIA NO SERVER.JS
// ======================================================

export default router;
