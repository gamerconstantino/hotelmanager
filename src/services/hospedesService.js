


import { apiFetch } from './api.js';

const API_URL = 'http://localhost:5000/api/hospedes';

// LISTAR E PESQUISAR
export async function listarHospedes(pesquisa = '') {
  const resposta = await apiFetch(
    `${API_URL}?q=${encodeURIComponent(pesquisa)}`
  );

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao consultar hóspedes.');
  }

  return resultado;
}

// CADASTRAR
export async function cadastrarHospede(dados) {
  const resposta = await apiFetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao cadastrar hóspede.');
  }

  return resultado;
}

// EDITAR
export async function atualizarHospede(id, dados) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao atualizar hóspede.');
  }

  return resultado;
}

// ELIMINAR
export async function eliminarHospede(id) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao eliminar hóspede.');
  }

  return resultado;
}