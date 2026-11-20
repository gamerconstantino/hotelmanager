


import { apiFetch } from './api.js';

const API_URL = 'http://localhost:5000/api/quartos';

// CONSULTAR TODOS OS QUARTOS
export async function listarQuartos() {
  const resposta = await apiFetch(API_URL);

  if (!resposta.ok) {
    throw new Error('Não foi possível consultar os quartos.');
  }

  return await resposta.json();
}

// CADASTRAR QUARTO
export async function cadastrarQuarto(dados) {
  const resposta = await apiFetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao cadastrar quarto.');
  }

  return resultado;
}

// EDITAR QUARTO
export async function atualizarQuarto(id, dados) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao atualizar quarto.');
  }

  return resultado;
}

// ELIMINAR QUARTO
export async function eliminarQuarto(id) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao eliminar quarto.');
  }

  return resultado;
}