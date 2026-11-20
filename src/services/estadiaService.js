
import { apiFetch } from './api.js';

const API_URL = 'http://localhost:5000/api/estadia';

async function executarAcao(id, acao) {
  const resposta = await apiFetch(
    `${API_URL}/${id}/${acao}`,
    {
      method: 'PATCH'
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.message || `Erro ao realizar ${acao}.`
    );
  }

  return dados;
}

export async function realizarCheckin(id) {
  return executarAcao(id, 'checkin');
}

export async function realizarCheckout(id) {
  return executarAcao(id, 'checkout');
}
