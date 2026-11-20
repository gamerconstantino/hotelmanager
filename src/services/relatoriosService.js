import { apiFetch } from './api.js';

const API_URL = 'http://localhost:5000/api/relatorios';

// BUSCAR OS DADOS DOS RELATÓRIOS
export async function buscarRelatorios(dataInicio = '', dataFim = '') {
  try {
    const parametros = new URLSearchParams();

    if (dataInicio) {
      parametros.append('data_inicio', dataInicio);
    }

    if (dataFim) {
      parametros.append('data_fim', dataFim);
    }

    const url = `${API_URL}/resumo?${parametros.toString()}`;

    const resposta = await apiFetch(url);
    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.message || 'Erro ao carregar relatórios.'
      );
    }

    return resultado;

  } catch (error) {
    console.error('Erro no serviço de relatórios:', error);

    throw new Error(
      error.message || 'Não foi possível comunicar com o servidor.'
    );
  }
}