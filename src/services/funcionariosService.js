


import { apiFetch } from './api.js';
const API_URL = 'http://localhost:5000/api/funcionarios';
// LISTAR FUNCIONÁRIOS
export async function listarFuncionarios(pesquisa = '') {
  const resposta = await apiFetch(
    `${API_URL}?q=${encodeURIComponent(pesquisa)}`
  );
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao consultar funcionários.');
  }
  return resultado;
}
// CADASTRAR FUNCIONÁRIO
export async function cadastrarFuncionario(dados) {
  const resposta = await apiFetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao cadastrar funcionário.');
  }
  return resultado;
}
// ATUALIZAR FUNCIONÁRIO
export async function atualizarFuncionario(id, dados) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao atualizar funcionário.');
  }
  return resultado;
}
// ELIMINAR FUNCIONÁRIO
export async function eliminarFuncionario(id) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao eliminar funcionário.');
  }
  return resultado;
}