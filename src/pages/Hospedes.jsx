
import { useEffect, useState } from 'react';

import {
  listarHospedes,
  cadastrarHospede,
  atualizarHospede,
  eliminarHospede
} from '../services/hospedesService.js';

function Hospedes() {
  const formularioInicial = {
    nome_completo: '',
    documento: '',
    telefone: '',
    email: '',
    endereco: ''
  };

  const [hospedes, setHospedes] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [hospedeEdicao, setHospedeEdicao] = useState(null);
  const [pesquisa, setPesquisa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // CARREGAR HÓSPEDES
  async function carregarHospedes(termo = pesquisa) {
    try {
      setCarregando(true);
      setErro('');

      const dados = await listarHospedes(termo);
      setHospedes(dados);

    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarHospedes('');
  }, []);

  // ATUALIZAR FORMULÁRIO
  function atualizarCampo(event) {
    const { name, value } = event.target;

    setFormulario(anterior => ({
      ...anterior,
      [name]: value
    }));
  }

  // NOVO HÓSPEDE
  function novoHospede() {
    setFormulario(formularioInicial);
    setHospedeEdicao(null);
    setMostrarFormulario(true);
    setErro('');
    setSucesso('');
  }

  // EDITAR HÓSPEDE
  function editarHospede(hospede) {
    setFormulario({
      nome_completo: hospede.nome_completo,
      documento: hospede.documento,
      telefone: hospede.telefone,
      email: hospede.email || '',
      endereco: hospede.endereco || ''
    });

    setHospedeEdicao(hospede.id);
    setMostrarFormulario(true);
    setErro('');
    setSucesso('');
  }

  // GUARDAR HÓSPEDE
  async function guardarHospede(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro('');
      setSucesso('');

      if (hospedeEdicao) {
        await atualizarHospede(hospedeEdicao, formulario);
        setSucesso('Hóspede atualizado com sucesso!');
      } else {
        await cadastrarHospede(formulario);
        setSucesso('Hóspede cadastrado com sucesso!');
      }

      setFormulario(formularioInicial);
      setHospedeEdicao(null);
      setMostrarFormulario(false);

      await carregarHospedes('');

      setPesquisa('');

    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  // ELIMINAR HÓSPEDE
  async function removerHospede(id) {
    const confirmar = window.confirm(
      'Tens a certeza de que pretendes eliminar este hóspede?'
    );

    if (!confirmar) return;

    try {
      setErro('');
      setSucesso('');

      await eliminarHospede(id);

      setSucesso('Hóspede eliminado com sucesso!');
      await carregarHospedes();

    } catch (error) {
      setErro(error.message);
    }
  }

  const campo = {
    width: '100%',
    padding: '11px',
    marginTop: '7px',
    border: '1px solid #d1d5db',
    borderRadius: '7px',
    boxSizing: 'border-box',
    fontSize: '14px'
  };

  const botao = {
    padding: '11px 17px',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    color: '#fff',
    fontWeight: '600'
  };

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
          <h1 style={{ margin: 0 }}>Gestão de Hóspedes</h1>
          <p style={{ color: '#6b7280' }}>
            Gere os dados e informações dos hóspedes do hotel.
          </p>
        </div>

        <button
          onClick={novoHospede}
          style={{ ...botao, background: '#2563eb' }}
        >
          + Novo hóspede
        </button>
      </div>

      {/* MENSAGENS */}
      {erro && (
        <div style={{
          padding: '12px',
          marginTop: '18px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px'
        }}>
          {erro}
        </div>
      )}

      {sucesso && (
        <div style={{
          padding: '12px',
          marginTop: '18px',
          background: '#dcfce7',
          color: '#166534',
          borderRadius: '8px'
        }}>
          {sucesso}
        </div>
      )}

      {/* FORMULÁRIO */}
      {mostrarFormulario && (
        <div style={{
          background: '#fff',
          padding: '22px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginTop: '25px'
        }}>
          <h2>
            {hospedeEdicao ? 'Editar hóspede' : 'Cadastrar hóspede'}
          </h2>

          <form onSubmit={guardarHospede}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px'
            }}>
              <div>
                <label>Nome completo *</label>
                <input
                  style={campo}
                  name="nome_completo"
                  value={formulario.nome_completo}
                  onChange={atualizarCampo}
                  placeholder="Nome do hóspede"
                  required
                />
              </div>

              <div>
                <label>Número do documento *</label>
                <input
                  style={campo}
                  name="documento"
                  value={formulario.documento}
                  onChange={atualizarCampo}
                  placeholder="BI ou passaporte"
                  required
                />
              </div>

              <div>
                <label>Telefone *</label>
                <input
                  style={campo}
                  name="telefone"
                  value={formulario.telefone}
                  onChange={atualizarCampo}
                  placeholder="+244 9XX XXX XXX"
                  required
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  style={campo}
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={atualizarCampo}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Endereço</label>
                <input
                  style={campo}
                  name="endereco"
                  value={formulario.endereco}
                  onChange={atualizarCampo}
                  placeholder="Morada do hóspede"
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
                style={{ ...botao, background: '#2563eb' }}
              >
                {salvando
                  ? 'A guardar...'
                  : hospedeEdicao
                    ? 'Atualizar hóspede'
                    : 'Guardar hóspede'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setHospedeEdicao(null);
                  setFormulario(formularioInicial);
                  setErro('');
                }}
                style={{
                  ...botao,
                  background: '#6b7280'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PESQUISA */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '30px',
        flexWrap: 'wrap'
      }}>
        <input
          style={{
            ...campo,
            flex: 1,
            minWidth: '220px',
            marginTop: 0
          }}
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') carregarHospedes(pesquisa);
          }}
          placeholder="Pesquisar por nome, documento, telefone ou email..."
        />

        <button
          onClick={() => carregarHospedes(pesquisa)}
          style={{ ...botao, background: '#2563eb' }}
        >
          Pesquisar
        </button>

        <button
          onClick={() => {
            setPesquisa('');
            carregarHospedes('');
          }}
          style={{ ...botao, background: '#6b7280' }}
        >
          Limpar
        </button>
      </div>

      {/* TABELA */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        marginTop: '22px',
        overflowX: 'auto'
      }}>
        <div style={{ padding: '18px' }}>
          <h2 style={{ margin: 0 }}>
            Hóspedes registados ({hospedes.length})
          </h2>
        </div>

        {carregando ? (
          <p style={{ padding: '18px' }}>A carregar hóspedes...</p>
        ) : hospedes.length === 0 ? (
          <p style={{ padding: '18px', color: '#6b7280' }}>
            Nenhum hóspede encontrado.
          </p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: '750px'
          }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '13px' }}>Nome</th>
                <th style={{ padding: '13px' }}>Documento</th>
                <th style={{ padding: '13px' }}>Telefone</th>
                <th style={{ padding: '13px' }}>Email</th>
                <th style={{ padding: '13px' }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {hospedes.map((hospede) => (
                <tr
                  key={hospede.id}
                  style={{ borderTop: '1px solid #e5e7eb' }}
                >
                  <td style={{ padding: '13px' }}>
                    {hospede.nome_completo}
                  </td>

                  <td style={{ padding: '13px' }}>
                    {hospede.documento}
                  </td>

                  <td style={{ padding: '13px' }}>
                    {hospede.telefone}
                  </td>

                  <td style={{ padding: '13px' }}>
                    {hospede.email || '—'}
                  </td>

                  <td style={{
                    padding: '13px',
                    whiteSpace: 'nowrap'
                  }}>
                    <button
                      onClick={() => editarHospede(hospede)}
                      style={{
                        ...botao,
                        background: '#0f766e',
                        marginRight: '7px'
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => removerHospede(hospede.id)}
                      style={{
                        ...botao,
                        background: '#dc2626'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Hospedes;