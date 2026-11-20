
import { useEffect, useState } from 'react';

import {
  listarReservas,
  carregarOpcoesReserva,
  cadastrarReserva,
  atualizarReserva,
  cancelarReserva
} from '../services/reservasServices.js';

import {
  realizarCheckin,
  realizarCheckout
} from '../services/estadiaService.js';

const formularioInicial = {
  hospede_id: '',
  quarto_id: '',
  data_checkin: '',
  data_checkout: '',
  numero_hospedes: 1,
  estado: 'Pendente',
  observacoes: ''
};

const estados = [
  'Pendente',
  'Confirmada',
  'Em andamento',
  'Concluida',
  'Cancelada'
];

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [hospedes, setHospedes] = useState([]);
  const [quartos, setQuartos] = useState([]);

  const [formulario, setFormulario] = useState(formularioInicial);
  const [reservaEdicao, setReservaEdicao] = useState(null);

  const [pesquisa, setPesquisa] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acaoEstadia, setAcaoEstadia] = useState(null);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [precoDiaria, setPrecoDiaria] = useState(0);

  const quartoSelecionado = quartos.find(
    quarto => String(quarto.id) === String(formulario.quarto_id)
  );

  const noites = formulario.data_checkin && formulario.data_checkout
    ? Math.max(
        0,
        Math.round(
          (
            new Date(`${formulario.data_checkout}T00:00:00Z`) -
            new Date(`${formulario.data_checkin}T00:00:00Z`)
          ) / 86400000
        )
      )
    : 0;

  const valorEstimado = noites * precoDiaria;

  const campo = {
    width: '100%',
    padding: '11px',
    marginTop: '7px',
    border: '1px solid #d1d5db',
    borderRadius: '7px',
    boxSizing: 'border-box',
    fontSize: '14px',
    background: '#fff'
  };

  const botao = {
    padding: '11px 16px',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    color: '#fff',
    fontWeight: '600'
  };

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const [lista, opcoes] = await Promise.all([
        listarReservas(pesquisa, filtroEstado),
        carregarOpcoesReserva()
      ]);

      setReservas(lista);
      setHospedes(opcoes.hospedes);
      setQuartos(opcoes.quartos);

    } catch (error) {
      setErro(error.message || 'Erro ao carregar reservas.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setFormulario(anterior => ({
      ...anterior,
      [name]: value
    }));

    if (name === 'quarto_id') {
      const quarto = quartos.find(
        item => String(item.id) === String(value)
      );

      setPrecoDiaria(Number(quarto?.preco_diaria || 0));
    }
  }

  function novaReserva() {
    setFormulario(formularioInicial);
    setReservaEdicao(null);
    setPrecoDiaria(0);
    setMostrarFormulario(true);
    setErro('');
    setSucesso('');
  }

  function editarReserva(reserva) {
    setFormulario({
      hospede_id: String(reserva.hospede_id),
      quarto_id: String(reserva.quarto_id),
      data_checkin: String(reserva.data_checkin).slice(0, 10),
      data_checkout: String(reserva.data_checkout).slice(0, 10),
      numero_hospedes: reserva.numero_hospedes,
      estado: reserva.estado,
      observacoes: reserva.observacoes || ''
    });

    const quarto = quartos.find(
      item => Number(item.id) === Number(reserva.quarto_id)
    );

    setPrecoDiaria(Number(quarto?.preco_diaria || 0));
    setReservaEdicao(reserva.id);
    setMostrarFormulario(true);
    setErro('');
    setSucesso('');
  }

  async function guardarReserva(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro('');
      setSucesso('');

      if (noites <= 0) {
        throw new Error(
          'A data de saída deve ser posterior à data de entrada.'
        );
      }

      if (!formulario.hospede_id || !formulario.quarto_id) {
        throw new Error('Selecione um hóspede e um quarto.');
      }

      if (
        Number(formulario.numero_hospedes) >
        Number(quartoSelecionado?.capacidade || 0)
      ) {
        throw new Error(
          'O número de hóspedes ultrapassa a capacidade do quarto.'
        );
      }

      if (reservaEdicao) {
        await atualizarReserva(reservaEdicao, formulario);
        setSucesso('Reserva atualizada com sucesso!');
      } else {
        await cadastrarReserva(formulario);
        setSucesso('Reserva registada com sucesso!');
      }

      setFormulario(formularioInicial);
      setReservaEdicao(null);
      setMostrarFormulario(false);
      setPrecoDiaria(0);

      await carregarDados();

    } catch (error) {
      setErro(error.message || 'Erro ao guardar reserva.');
    } finally {
      setSalvando(false);
    }
  }

  async function removerReserva(id) {
    const confirmar = window.confirm(
      'Tens a certeza de que pretendes cancelar esta reserva?'
    );

    if (!confirmar) return;

    try {
      setErro('');
      setSucesso('');

      await cancelarReserva(id);

      setSucesso('Reserva cancelada com sucesso!');
      await carregarDados();

    } catch (error) {
      setErro(error.message || 'Erro ao cancelar reserva.');
    }
  }

  async function executarCheckin(reserva) {
    const confirmar = window.confirm(
      `Confirmas o check-in da reserva de ${reserva.nome_completo}, quarto ${reserva.numero_quarto}?`
    );

    if (!confirmar) return;

    try {
      setAcaoEstadia(`${reserva.id}-checkin`);
      setErro('');
      setSucesso('');

      await realizarCheckin(reserva.id);

      setSucesso(
        `Check-in realizado com sucesso para ${reserva.nome_completo}!`
      );

      await carregarDados();

    } catch (error) {
      setErro(error.message || 'Erro ao realizar check-in.');
    } finally {
      setAcaoEstadia(null);
    }
  }

  async function executarCheckout(reserva) {
    const confirmar = window.confirm(
      `Confirmas o check-out da reserva de ${reserva.nome_completo}, quarto ${reserva.numero_quarto}?`
    );

    if (!confirmar) return;

    try {
      setAcaoEstadia(`${reserva.id}-checkout`);
      setErro('');
      setSucesso('');

      await realizarCheckout(reserva.id);

      setSucesso(
        `Check-out realizado com sucesso para ${reserva.nome_completo}!`
      );

      await carregarDados();

    } catch (error) {
      setErro(error.message || 'Erro ao realizar check-out.');
    } finally {
      setAcaoEstadia(null);
    }
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 2
    });
  }

  function corEstado(estado) {
    const cores = {
      Pendente: '#92400e',
      Confirmada: '#166534',
      'Em andamento': '#1d4ed8',
      Concluida: '#475569',
      Cancelada: '#991b1b'
    };

    return cores[estado] || '#374151';
  }

  return (
    <div style={{ padding: '25px', color: '#1f2937' }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestão de Reservas</h1>
          <p style={{ color: '#6b7280' }}>
            Registe, consulte e acompanhe as reservas do hotel.
          </p>
        </div>

        <button
          onClick={novaReserva}
          style={{ ...botao, background: '#2563eb' }}
        >
          + Nova reserva
        </button>
      </div>

      {erro && (
        <div style={{
          marginTop: '18px',
          padding: '13px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px'
        }}>
          {erro}
        </div>
      )}

      {sucesso && (
        <div style={{
          marginTop: '18px',
          padding: '13px',
          background: '#dcfce7',
          color: '#166534',
          borderRadius: '8px'
        }}>
          {sucesso}
        </div>
      )}

      {mostrarFormulario && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '22px',
          marginTop: '25px'
        }}>
          <h2>
            {reservaEdicao ? 'Editar reserva' : 'Nova reserva'}
          </h2>

          <form onSubmit={guardarReserva}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '18px'
            }}>

              <div>
                <label>Hóspede *</label>
                <select
                  name="hospede_id"
                  value={formulario.hospede_id}
                  onChange={atualizarCampo}
                  style={campo}
                  required
                >
                  <option value="">Selecionar hóspede</option>
                  {hospedes.map(hospede => (
                    <option key={hospede.id} value={hospede.id}>
                      {hospede.nome_completo} - {hospede.documento}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Quarto *</label>
                <select
                  name="quarto_id"
                  value={formulario.quarto_id}
                  onChange={atualizarCampo}
                  style={campo}
                  required
                >
                  <option value="">Selecionar quarto</option>
                  {quartos.map(quarto => (
                    <option key={quarto.id} value={quarto.id}>
                      Quarto {quarto.numero} - {quarto.tipo}
                      {' '}({formatarValor(quarto.preco_diaria)}/noite)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Data de entrada *</label>
                <input
                  type="date"
                  name="data_checkin"
                  value={formulario.data_checkin}
                  onChange={atualizarCampo}
                  style={campo}
                  required
                />
              </div>

              <div>
                <label>Data de saída *</label>
                <input
                  type="date"
                  name="data_checkout"
                  value={formulario.data_checkout}
                  min={formulario.data_checkin || undefined}
                  onChange={atualizarCampo}
                  style={campo}
                  required
                />
              </div>

              <div>
                <label>Número de hóspedes *</label>
                <input
                  type="number"
                  name="numero_hospedes"
                  min="1"
                  max={quartoSelecionado?.capacidade || undefined}
                  value={formulario.numero_hospedes}
                  onChange={atualizarCampo}
                  style={campo}
                  required
                />
                {quartoSelecionado && (
                  <small>
                    Capacidade máxima: {quartoSelecionado.capacidade}
                  </small>
                )}
              </div>

              {reservaEdicao && (
                <div>
                  <label>Estado da reserva</label>
                  <select
                    name="estado"
                    value={formulario.estado}
                    onChange={atualizarCampo}
                    style={campo}
                  >
                    {estados.map(estado => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Observações</label>
                <textarea
                  name="observacoes"
                  value={formulario.observacoes}
                  onChange={atualizarCampo}
                  style={{ ...campo, minHeight: '85px' }}
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '17px',
              background: '#eff6ff',
              borderRadius: '9px'
            }}>
              <strong>Resumo da reserva</strong>
              <p>Preço por noite: {formatarValor(precoDiaria)}</p>
              <p>Número de noites: {noites}</p>
              <h2 style={{ color: '#1d4ed8', marginBottom: 0 }}>
                Total: {formatarValor(valorEstimado)}
              </h2>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '22px',
              flexWrap: 'wrap'
            }}>
              <button
                type="submit"
                disabled={salvando}
                style={{
                  ...botao,
                  background: '#2563eb',
                  opacity: salvando ? 0.6 : 1
                }}
              >
                {salvando ? 'A guardar...' : 'Guardar reserva'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setReservaEdicao(null);
                  setFormulario(formularioInicial);
                  setPrecoDiaria(0);
                }}
                style={{ ...botao, background: '#6b7280' }}
              >
                Fechar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '28px',
        flexWrap: 'wrap'
      }}>
        <input
          value={pesquisa}
          onChange={event => setPesquisa(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') carregarDados();
          }}
          placeholder="Pesquisar hóspede, documento ou quarto..."
          style={{
            ...campo,
            flex: 1,
            minWidth: '220px',
            marginTop: 0
          }}
        />

        <select
          value={filtroEstado}
          onChange={event => setFiltroEstado(event.target.value)}
          style={{
            ...campo,
            width: '190px',
            marginTop: 0
          }}
        >
          <option value="">Todos os estados</option>
          {estados.map(estado => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <button
          onClick={carregarDados}
          style={{ ...botao, background: '#2563eb' }}
        >
          Pesquisar
        </button>
      </div>

      <div style={{
        marginTop: '22px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflowX: 'auto'
      }}>
        <div style={{ padding: '18px' }}>
          <h2 style={{ margin: 0 }}>
            Reservas registadas ({reservas.length})
          </h2>
        </div>

        {carregando ? (
          <p style={{ padding: '18px' }}>A carregar reservas...</p>
        ) : reservas.length === 0 ? (
          <p style={{ padding: '18px', color: '#6b7280' }}>
            Nenhuma reserva encontrada.
          </p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1100px',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {[
                  'HÓSPEDE',
                  'QUARTO',
                  'CHECK-IN',
                  'CHECK-OUT',
                  'HÓSPEDES',
                  'VALOR',
                  'ESTADO',
                  'AÇÕES'
                ].map(titulo => (
                  <th key={titulo} style={{ padding: '13px' }}>
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {reservas.map(reserva => {
                const ocupado = acaoEstadia !== null;

                return (
                  <tr
                    key={reserva.id}
                    style={{ borderTop: '1px solid #e5e7eb' }}
                  >
                    <td style={{ padding: '13px' }}>
                      <strong>{reserva.nome_completo}</strong>
                      <br />
                      <small>{reserva.telefone}</small>
                    </td>

                    <td style={{ padding: '13px' }}>
                      {reserva.numero_quarto} - {reserva.tipo_quarto}
                    </td>

                    <td style={{ padding: '13px' }}>
                      {String(reserva.data_checkin).slice(0, 10)}
                    </td>

                    <td style={{ padding: '13px' }}>
                      {String(reserva.data_checkout).slice(0, 10)}
                    </td>

                    <td style={{ padding: '13px' }}>
                      {reserva.numero_hospedes}
                    </td>

                    <td style={{ padding: '13px' }}>
                      {formatarValor(reserva.valor_total)}
                    </td>

                    <td style={{ padding: '13px' }}>
                      <span style={{
                        padding: '6px 9px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: corEstado(reserva.estado),
                        background: `${corEstado(reserva.estado)}18`
                      }}>
                        {reserva.estado}
                      </span>
                    </td>

                    <td style={{
                      padding: '13px',
                      whiteSpace: 'nowrap'
                    }}>
                      <button
                        disabled={ocupado}
                        onClick={() => editarReserva(reserva)}
                        style={{
                          ...botao,
                          background: '#0f766e',
                          marginRight: '6px',
                          opacity: ocupado ? 0.5 : 1
                        }}
                      >
                        Editar
                      </button>

                      {reserva.estado === 'Confirmada' && (
                        <button
                          disabled={ocupado}
                          onClick={() => executarCheckin(reserva)}
                          style={{
                            ...botao,
                            background: '#2563eb',
                            marginRight: '6px',
                            opacity: ocupado ? 0.5 : 1
                          }}
                        >
                          {acaoEstadia === `${reserva.id}-checkin`
                            ? 'A processar...'
                            : 'Check-in'}
                        </button>
                      )}

                      {reserva.estado === 'Em andamento' && (
                        <button
                          disabled={ocupado}
                          onClick={() => executarCheckout(reserva)}
                          style={{
                            ...botao,
                            background: '#7c3aed',
                            marginRight: '6px',
                            opacity: ocupado ? 0.5 : 1
                          }}
                        >
                          {acaoEstadia === `${reserva.id}-checkout`
                            ? 'A processar...'
                            : 'Check-out'}
                        </button>
                      )}

                      {reserva.estado !== 'Cancelada' &&
                       reserva.estado !== 'Concluida' && (
                        <button
                          disabled={ocupado}
                          onClick={() => removerReserva(reserva.id)}
                          style={{
                            ...botao,
                            background: '#dc2626',
                            opacity: ocupado ? 0.5 : 1
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reservas;
