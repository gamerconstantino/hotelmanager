import { apiFetch } from './api.js';

const API_URL = 'http://localhost:5000/api/utilizadores';

// LISTAR UTILIZADORES
export async function listarUtilizadores() {
  const resposta = await apiFetch(API_URL);
  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao consultar utilizadores.');
  }

  return resultado;
}

// CRIAR UTILIZADOR
export async function cadastrarUtilizador(dados) {
  const resposta = await apiFetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao criar utilizador.');
  }

  return resultado;
}

// ATUALIZAR UTILIZADOR
export async function atualizarUtilizador(id, dados) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao atualizar utilizador.');
  }

  return resultado;
}