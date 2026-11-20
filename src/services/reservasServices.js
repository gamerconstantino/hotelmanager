


import { apiFetch } from './api.js';
const API_URL = 'http://localhost:5000/api/reservas';
// LISTAR RESERVAS
export async function listarReservas(pesquisa = '', estado = '') {
  const parametros = new URLSearchParams({
    q: pesquisa,
    estado
  });
  const resposta = await apiFetch(`${API_URL}?${parametros}`);
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao consultar reservas.');
  }
  return resultado;
}
// CARREGAR HÓSPEDES E QUARTOS
export async function carregarOpcoesReserva() {
  const resposta = await apiFetch(`${API_URL}/opcoes`);
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao carregar opções.');
  }
  return resultado;
}
// CRIAR RESERVA
export async function cadastrarReserva(dados) {
  const resposta = await apiFetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao cadastrar reserva.');
  }
  return resultado;
}
// ATUALIZAR RESERVA
export async function atualizarReserva(id, dados) {
  const resposta = await apiFetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao atualizar reserva.');
  }
  return resultado;
}
// CANCELAR RESERVA
export async function cancelarReserva(id) {
  const resposta = await apiFetch(`${API_URL}/${id}/cancelar`, {
    method: 'PATCH'
  });
  const resultado = await resposta.json();
  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao cancelar reserva.');
  }
  return resultado;
}