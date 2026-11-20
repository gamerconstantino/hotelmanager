


import { useEffect, useState } from 'react';
import {
  listarQuartos,
  cadastrarQuarto,
  atualizarQuarto,
  eliminarQuarto
} from '../services/quartosServices.js';
function Quartos() {
  const formularioInicial = {
    numero: '',
    tipo: 'Individual',
    capacidade: 1,
    preco_diaria: '',
    estado: 'Disponivel',
    descricao: ''
  };
  const [quartos, setQuartos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [quartoEmEdicao, setQuartoEmEdicao] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  // CARREGAR QUARTOS
  async function carregarQuartos() {
    try {
      setCarregando(true);
      setErro('');
      const dados = await listarQuartos();
      setQuartos(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    carregarQuartos();
  }, []);
  // ATUALIZAR CAMPOS DO FORMULÁRIO
  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }
  // ABRIR FORMULÁRIO PARA NOVO QUARTO
  function abrirNovoQuarto() {
    setFormulario(formularioInicial);
    setQuartoEmEdicao(null);
    setMostrarFormulario(true);
    setErro('');
    setSucesso('');
  }
  // ABRIR FORMULÁRIO PARA EDITAR
  function editarQuarto(quarto) {
    setFormulario({
      numero: quarto.numero,
      tipo: quarto.tipo,
      capacidade: quarto.capacidade,
      preco_diaria: quarto.preco_diaria,
      estado: quarto.estado,
      descricao: quarto.descricao || ''
    });
    setQuartoEmEdicao(quarto.id);
    setMostrarFormulario(true);
    setErro('');
    setSucesso('');
  }
  // GUARDAR OU ATUALIZAR QUARTO
  async function guardarQuarto(event) {
    event.preventDefault();
    try {
      setSalvando(true);
      setErro('');
      setSucesso('');
      const dados = {
        ...formulario,
        capacidade: Number(formulario.capacidade),
        preco_diaria: Number(formulario.preco_diaria)
      };
      if (quartoEmEdicao) {
        await atualizarQuarto(quartoEmEdicao, dados);
        setSucesso('Quarto atualizado com sucesso!');
      } else {
        await cadastrarQuarto(dados);
        setSucesso('Quarto cadastrado com sucesso!');
      }
      setFormulario(formularioInicial);
      setQuartoEmEdicao(null);
      setMostrarFormulario(false);
      await carregarQuartos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }
  // ELIMINAR QUARTO
  async function removerQuarto(id) {
    const confirmar = window.confirm(
      'Tens a certeza de que pretendes eliminar este quarto?'
    );
    if (!confirmar) return;
    try {
      setErro('');
      setSucesso('');
      await eliminarQuarto(id);
      setSucesso('Quarto eliminado com sucesso!');
      await carregarQuartos();
    } catch (error) {
      setErro(error.message);
    }
  }
  const campoEstilo = {
    width: '100%',
    padding: '11px',
    marginTop: '7px',
    border: '1px solid #d1d5db',
    borderRadius: '7px',
    boxSizing: 'border-box',
    fontSize: '14px'
  };
  const botaoPrimario = {
    padding: '11px 18px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '600'
  };
  const botaoSecundario = {
    padding: '10px 16px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer'
  };
  function corEstado(estado) {
    if (estado === 'Disponivel') return '#15803d';
    if (estado === 'Ocupado') return '#b45309';
    return '#b91c1c';
  }
  function nomeEstado(estado) {
    if (estado === 'Disponivel') return 'Disponível';
    if (estado === 'Ocupado') return 'Ocupado';
    return 'Manutenção';
  }
  return (
    <div style={{ padding: '25px', color: '#1f2937' }}>
      {/* CABEÇALHO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestão de Quartos</h1>
          <p style={{ color: '#6b7280' }}>
            Administra os quartos e acompanha a sua disponibilidade.
          </p>
        </div>
        <button
          onClick={abrirNovoQuarto}
          style={botaoPrimario}
        >
          + Adicionar quarto
        </button>
      </div>
      {/* MENSAGENS */}
      {erro && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '18px'
        }}>
          {erro}
        </div>
      )}
      {sucesso && (
        <div style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '18px'
        }}>
          {sucesso}
        </div>
      )}
      {/* FORMULÁRIO */}
      {mostrarFormulario && (
        <div style={{
          background: '#fff',
          padding: '22px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginTop: '25px'
        }}>
          <h2>
            {quartoEmEdicao ? 'Editar quarto' : 'Cadastrar novo quarto'}
          </h2>
          <form onSubmit={guardarQuarto}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px'
            }}>
              <div>
                <label>Número do quarto</label>
                <input
                  style={campoEstilo}
                  name="numero"
                  value={formulario.numero}
                  onChange={atualizarCampo}
                  placeholder="Ex: 101"
                  required
                />
              </div>
              <div>
                <label>Tipo de quarto</label>
                <select
                  style={campoEstilo}
                  name="tipo"
                  value={formulario.tipo}
                  onChange={atualizarCampo}
                >
                  <option value="Individual">Individual</option>
                  <option value="Duplo">Duplo</option>
                  <option value="Casal">Casal</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
              <div>
                <label>Capacidade (pessoas)</label>
                <input
                  style={campoEstilo}
                  type="number"
                  name="capacidade"
                  min="1"
                  value={formulario.capacidade}
                  onChange={atualizarCampo}
                  required
                />
              </div>
              <div>
                <label>Preço por noite (Kz)</label>
                <input
                  style={campoEstilo}
                  type="number"
                  name="preco_diaria"
                  min="1"
                  value={formulario.preco_diaria}
                  onChange={atualizarCampo}
                  placeholder="Ex: 25000"
                  required
                />
              </div>
              <div>
                <label>Estado do quarto</label>
                <select
                  style={campoEstilo}
                  name="estado"
                  value={formulario.estado}
                  onChange={atualizarCampo}
                >
                  <option value="Disponivel">Disponível</option>
                  <option value="Ocupado">Ocupado</option>
                  <option value="Manutencao">Manutenção</option>
                </select>
              </div>
              <div>
                <label>Descrição</label>
                <input
                  style={campoEstilo}
                  name="descricao"
                  value={formulario.descricao}
                  onChange={atualizarCampo}
                  placeholder="Descrição do quarto"
                />
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '22px'
            }}>
              <button
                type="submit"
                disabled={salvando}
                style={botaoPrimario}
              >
                {salvando ? 'A guardar...' :
                  quartoEmEdicao ? 'Atualizar quarto' : 'Guardar quarto'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setQuartoEmEdicao(null);
                  setFormulario(formularioInicial);
                  setErro('');
                }}
                style={botaoSecundario}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {/* LISTA DE QUARTOS */}
      <div style={{ marginTop: '30px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2>Quartos cadastrados ({quartos.length})</h2>
          <button
            onClick={carregarQuartos}
            style={botaoSecundario}
          >
            Atualizar lista
          </button>
        </div>
        {carregando && <p>A carregar quartos...</p>}
        {!carregando && quartos.length === 0 && (
          <div style={{
            background: '#fff',
            padding: '25px',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            Ainda não existem quartos cadastrados.
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          marginTop: '18px'
        }}>
          {quartos.map((quarto) => (
            <div
              key={quarto.id}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}>
                <h3 style={{ margin: 0 }}>
                  Quarto {quarto.numero}
                </h3>
                <span style={{
                  color: corEstado(quarto.estado),
                  background: '#f3f4f6',
                  padding: '5px 9px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {nomeEstado(quarto.estado)}
                </span>
              </div>
              <p>Tipo: {quarto.tipo}</p>
              <p>Capacidade: {quarto.capacidade} pessoa(s)</p>
              <p>
                Preço por noite: {' '}
                {Number(quarto.preco_diaria).toLocaleString('pt-AO')} Kz
              </p>
              {quarto.descricao && (
                <p>Descrição: {quarto.descricao}</p>
              )}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '18px'
              }}>
                <button
                  onClick={() => editarQuarto(quarto)}
                  style={{
                    ...botaoPrimario,
                    background: '#0f766e'
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => removerQuarto(quarto.id)}
                  style={{
                    ...botaoPrimario,
                    background: '#dc2626'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Quartos;