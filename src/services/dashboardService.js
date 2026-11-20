
import { apiFetch } from './api.js';

const API_URL = 'http://localhost:5000/api/relatorios/dashboard';

export async function obterDashboard(filtros = {}) {
  const parametros = new URLSearchParams();

  parametros.set('periodo', filtros.periodo || '7dias');

  if (filtros.periodo === 'personalizado') {
    if (!filtros.data_inicio || !filtros.data_fim) {
      throw new Error('Seleciona a data inicial e a data final.');
    }

    parametros.set('data_inicio', filtros.data_inicio);
    parametros.set('data_fim', filtros.data_fim);
  }

  const resposta = await apiFetch(
    `${API_URL}?${parametros.toString()}`
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.message || 'Erro ao carregar o Dashboard.'
    );
  }

  return dados;
}
