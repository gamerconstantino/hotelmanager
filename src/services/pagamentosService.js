
import { apiFetch } from './api.js';

const API_URL = 'http://localhost:5000/api/pagamentos';

async function processarResposta(resposta, mensagemPadrao) {
  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || mensagemPadrao);
  }

  return resultado;
}

// LISTAR PAGAMENTOS
export async function listarPagamentos(filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      params.append(chave, valor);
    }
  });

  const resposta = await apiFetch(`${API_URL}?${params.toString()}`);

  return processarResposta(
    resposta,
    'Erro ao consultar pagamentos.'
  );
}

// CARREGAR RESERVAS E SALDOS
export async function carregarReservasPagamento() {
  const resposta = await apiFetch(`${API_URL}/opcoes`);

  return processarResposta(
    resposta,
    'Erro ao carregar reservas.'
  );
}

// REGISTAR PAGAMENTO
export async function cadastrarPagamento(dados) {
  const resposta = await apiFetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  return processarResposta(
    resposta,
    'Erro ao registar pagamento.'
  );
}

// CONFIRMAR PAGAMENTO PENDENTE
export async function confirmarPagamento(id) {
  const resposta = await apiFetch(`${API_URL}/${id}/confirmar`, {
    method: 'PATCH'
  });

  return processarResposta(
    resposta,
    'Erro ao confirmar pagamento.'
  );
}

// ESTORNAR PAGAMENTO
export async function estornarPagamento(id) {
  const resposta = await apiFetch(`${API_URL}/${id}/estornar`, {
    method: 'PATCH'
  });

  return processarResposta(
    resposta,
    'Erro ao estornar pagamento.'
  );
}
