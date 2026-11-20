
import { useEffect, useState } from 'react';

import {
  listarPagamentos,
  carregarReservasPagamento,
  cadastrarPagamento,
  confirmarPagamento,
  estornarPagamento
} from '../services/pagamentosService.js';

const formularioInicial = {
  reserva_id: '',
  valor: '',
  metodo: 'Dinheiro',
  estado: 'Pago',
  referencia: ''
};

const moeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' Kz';

function escaparHTML(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[caractere]);
}

function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);

  const [pesquisa, setPesquisa] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acaoId, setAcaoId] = useState(null);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const [lista, opcoes] = await Promise.all([
        listarPagamentos({
          q: pesquisa,
          estado: filtroEstado,
          data_inicio: dataInicio,
          data_fim: dataFim
        }),
        carregarReservasPagamento()
      ]);

      setPagamentos(lista);
      setReservas(opcoes);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [pesquisa, filtroEstado, dataInicio, dataFim]);

  const reservaSelecionada = reservas.find(
    (r) => String(r.id) === String(formulario.reserva_id)
  );

  const totalRecebido = pagamentos
    .filter((p) => p.estado === 'Pago')
    .reduce((total, p) => total + Number(p.valor || 0), 0);

  const totalPendente = pagamentos
    .filter((p) => p.estado === 'Pendente')
    .reduce((total, p) => total + Number(p.valor || 0), 0);

  const totalEstornado = pagamentos
    .filter((p) => p.estado === 'Estornado')
    .reduce((total, p) => total + Number(p.valor || 0), 0);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  async function guardarPagamento(event) {
    event.preventDefault();

    if (!reservaSelecionada) {
      setErro('Seleciona uma reserva válida.');
      return;
    }

    const valor = Number(formulario.valor);

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('Introduz um valor válido.');
      return;
    }

    if (valor > Number(reservaSelecionada.saldo)) {
      setErro('O valor ultrapassa o saldo disponível da reserva.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setSucesso('');

      await cadastrarPagamento(formulario);

      setSucesso('Pagamento registado com sucesso!');
      setFormulario(formularioInicial);
      setMostrarFormulario(false);

      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarPagamentoPendente(id) {
    const confirmar = window.confirm(
      'Confirmas que este valor foi efetivamente recebido?'
    );

    if (!confirmar) return;

    try {
      setAcaoId(id);
      setErro('');
      setSucesso('');

      await confirmarPagamento(id);

      setSucesso('Pagamento confirmado com sucesso!');
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setAcaoId(null);
    }
  }

  async function confirmarEstorno(id) {
    const confirmar = window.confirm(
      'Tens a certeza de que desejas estornar este pagamento?'
    );

    if (!confirmar) return;

    try {
      setAcaoId(id);
      setErro('');
      setSucesso('');

      await estornarPagamento(id);

      setSucesso('Pagamento estornado com sucesso!');
      await carregarDados();
    } catch (error) {
      setErro(error.message);
    } finally {
      setAcaoId(null);
    }
  }

  function imprimirRecibo(pagamento) {
    const janela = window.open('', '_blank', 'width=800,height=700');

    if (!janela) {
      setErro('Permite a abertura de janelas pop-up para imprimir o recibo.');
      return;
    }

    const data = pagamento.data_pagamento
      ? new Date(pagamento.data_pagamento).toLocaleString('pt-PT')
      : new Date().toLocaleString('pt-PT');

    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <title>Recibo de pagamento #${escaparHTML(pagamento.id)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #1e293b;
          }
          .recibo {
            max-width: 650px;
            margin: auto;
            border: 1px solid #ddd;
            padding: 35px;
          }
          h1 { text-align: center; }
          .linha {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
          }
          .total {
            font-size: 22px;
            font-weight: bold;
            margin-top: 20px;
          }
          .rodape {
            margin-top: 45px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            .recibo { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="recibo">
          <h1>RECIBO DE PAGAMENTO</h1>
          <p style="text-align:center">HotelManager</p>
          <hr>
          <div class="linha">
            <span>Número do recibo</span>
            <strong>#${escaparHTML(pagamento.id)}</strong>
          </div>
          <div class="linha">
            <span>Hóspede</span>
            <strong>${escaparHTML(pagamento.hospede)}</strong>
          </div>
          <div class="linha">
            <span>Reserva</span>
            <strong>#${escaparHTML(pagamento.reserva_id)}</strong>
          </div>
          <div class="linha">
            <span>Método de pagamento</span>
            <strong>${escaparHTML(pagamento.metodo)}</strong>
          </div>
          <div class="linha">
            <span>Referência</span>
            <strong>${escaparHTML(pagamento.referencia || 'Não indicada')}</strong>
          </div>
          <div class="linha">
            <span>Estado</span>
            <strong>${escaparHTML(pagamento.estado)}</strong>
          </div>
          <div class="linha">
            <span>Data</span>
            <strong>${escaparHTML(data)}</strong>
          </div>
          <div class="total">
            Valor: ${escaparHTML(moeda(pagamento.valor))}
          </div>
          <div class="rodape">
            Documento gerado pelo sistema HotelManager.
            <br>Obrigado pela preferência.
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    janela.document.close();
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #dce2ea',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const botaoStyle = {
    padding: '9px 13px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  };

  const cartaoStyle = {
    background: '#fff',
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px'
  };

  return (
    <div style={{ padding: '20px', color: '#1e293b' }}>

      {/* CABEÇALHO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Gestão de Pagamentos</h2>
          <p style={{ color: '#64748b' }}>
            Recebimentos, pagamentos parciais e controlo financeiro.
          </p>
        </div>

        <button
          onClick={() => {
            setErro('');
            setSucesso('');
            setMostrarFormulario(!mostrarFormulario);
          }}
          style={{
            ...botaoStyle,
            background: '#2563eb',
            color: '#fff'
          }}
        >
          + Registar pagamento
        </button>
      </div>

      {/* MENSAGENS */}
      {erro && (
        <div style={{
          padding: '12px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          {erro}
        </div>
      )}

      {sucesso && (
        <div style={{
          padding: '12px',
          background: '#dcfce7',
          color: '#166534',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          {sucesso}
        </div>
      )}

      {/* INDICADORES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={cartaoStyle}>
          <p style={{ color: '#64748b', margin: 0 }}>
            Total recebido
          </p>
          <h2 style={{ color: '#16a34a', marginBottom: 0 }}>
            {moeda(totalRecebido)}
          </h2>
        </div>

        <div style={cartaoStyle}>
          <p style={{ color: '#64748b', margin: 0 }}>
            Total pendente
          </p>
          <h2 style={{ color: '#d97706', marginBottom: 0 }}>
            {moeda(totalPendente)}
          </h2>
        </div>

        <div style={cartaoStyle}>
          <p style={{ color: '#64748b', margin: 0 }}>
            Total estornado
          </p>
          <h2 style={{ color: '#dc2626', marginBottom: 0 }}>
            {moeda(totalEstornado)}
          </h2>
        </div>
      </div>

      <p style={{
        color: '#64748b',
        fontSize: '12px',
        marginTop: '-12px',
        marginBottom: '20px'
      }}>
        Os indicadores representam os resultados dos filtros aplicados.
      </p>

      {/* FORMULÁRIO */}
      {mostrarFormulario && (
        <div style={{
          background: '#fff',
          padding: '22px',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <h3>Registar pagamento</h3>

          <form onSubmit={guardarPagamento}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label>Reserva *</label>
                <select
                  name="reserva_id"
                  value={formulario.reserva_id}
                  onChange={alterarCampo}
                  style={inputStyle}
                  required
                >
                  <option value="">Selecionar reserva</option>

                  {reservas.map((reserva) => (
                    <option
                      key={reserva.id}
                      value={reserva.id}
                      disabled={Number(reserva.saldo) <= 0}
                    >
                      Reserva #{reserva.id} - {reserva.hospede}
                      {' - Quarto '}{reserva.numero_quarto}
                      {' - Saldo: '}{moeda(reserva.saldo)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Valor (Kz) *</label>
                <input
                  type="number"
                  name="valor"
                  min="0.01"
                  step="0.01"
                  max={reservaSelecionada?.saldo ?? undefined}
                  value={formulario.valor}
                  onChange={alterarCampo}
                  style={inputStyle}
                  placeholder="Ex.: 25000"
                  required
                />
              </div>

              <div>
                <label>Método de pagamento *</label>
                <select
                  name="metodo"
                  value={formulario.metodo}
                  onChange={alterarCampo}
                  style={inputStyle}
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Multicaixa">Multicaixa</option>
                  <option value="Transferencia">Transferência</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label>Estado inicial</label>
                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={alterarCampo}
                  style={inputStyle}
                >
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <div>
                <label>Referência</label>
                <input
                  name="referencia"
                  value={formulario.referencia}
                  onChange={alterarCampo}
                  style={inputStyle}
                  placeholder="Referência da operação"
                />
              </div>
            </div>

            {reservaSelecionada && (
              <div style={{
                background: '#f8fafc',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '18px'
              }}>
                <p>
                  <strong>Hóspede:</strong> {reservaSelecionada.hospede}
                </p>
                <p>
                  <strong>Valor da reserva:</strong>{' '}
                  {moeda(reservaSelecionada.valor_total)}
                </p>
                <p>
                  <strong>Total recebido:</strong>{' '}
                  {moeda(reservaSelecionada.total_pago)}
                </p>
                <p>
                  <strong>Total pendente:</strong>{' '}
                  {moeda(reservaSelecionada.total_pendente)}
                </p>
                <p>
                  <strong>Saldo disponível:</strong>{' '}
                  {moeda(reservaSelecionada.saldo)}
                </p>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                type="submit"
                disabled={salvando}
                style={{
                  ...botaoStyle,
                  background: '#2563eb',
                  color: '#fff',
                  opacity: salvando ? 0.6 : 1
                }}
              >
                {salvando ? 'A guardar...' : 'Guardar pagamento'}
              </button>

              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                style={{
                  ...botaoStyle,
                  background: '#e2e8f0',
                  color: '#334155'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTROS */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <input
          style={{ ...inputStyle, maxWidth: '260px' }}
          placeholder="Pesquisar hóspede ou reserva..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />

        <select
          style={{ ...inputStyle, maxWidth: '180px' }}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos os estados</option>
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
          <option value="Estornado">Estornado</option>
        </select>

        <input
          type="date"
          style={{ ...inputStyle, maxWidth: '180px' }}
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />

        <input
          type="date"
          style={{ ...inputStyle, maxWidth: '180px' }}
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflowX: 'auto'
      }}>
        <table style={{
          width: '100%',
          minWidth: '1050px',
          borderCollapse: 'collapse'
        }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {[
                'N.º',
                'Hóspede',
                'Reserva',
                'Valor',
                'Método',
                'Estado',
                'Referência',
                'Data',
                'Ações'
              ].map((titulo) => (
                <th
                  key={titulo}
                  style={{
                    padding: '13px',
                    textAlign: 'left',
                    borderBottom: '1px solid #e2e8f0'
                  }}
                >
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="9" style={{
                  padding: '25px',
                  textAlign: 'center'
                }}>
                  A carregar pagamentos...
                </td>
              </tr>
            ) : pagamentos.length === 0 ? (
              <tr>
                <td colSpan="9" style={{
                  padding: '25px',
                  textAlign: 'center'
                }}>
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            ) : (
              pagamentos.map((pagamento) => (
                <tr key={pagamento.id}>
                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    {pagamento.id}
                  </td>

                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    {pagamento.hospede}
                  </td>

                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    #{pagamento.reserva_id}
                  </td>

                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    {moeda(pagamento.valor)}
                  </td>

                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    {pagamento.metodo}
                  </td>

                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    <span style={{
                      padding: '5px 9px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      background:
                        pagamento.estado === 'Pago' ? '#dcfce7' :
                        pagamento.estado === 'Pendente' ? '#fef3c7' :
                        '#fee2e2',
                      color:
                        pagamento.estado === 'Pago' ? '#166534' :
                        pagamento.estado === 'Pendente' ? '#92400e' :
                        '#991b1b'
                    }}>
                      {pagamento.estado}
                    </span>
                  </td>

                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    {pagamento.referencia || '—'}
                  </td>

                  <td style={{ padding: '13px', borderBottom: '1px solid #eee' }}>
                    {pagamento.data_pagamento
                      ? new Date(pagamento.data_pagamento).toLocaleDateString('pt-PT')
                      : '—'}
                  </td>

                  <td style={{
                    padding: '13px',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => imprimirRecibo(pagamento)}
                        style={{
                          ...botaoStyle,
                          background: '#e0f2fe',
                          color: '#075985'
                        }}
                      >
                        Recibo
                      </button>

                      {pagamento.estado === 'Pendente' && (
                        <button
                          disabled={acaoId === pagamento.id}
                          onClick={() => confirmarPagamentoPendente(pagamento.id)}
                          style={{
                            ...botaoStyle,
                            background: '#dcfce7',
                            color: '#166534'
                          }}
                        >
                          {acaoId === pagamento.id ? 'A processar...' : 'Confirmar'}
                        </button>
                      )}

                      {pagamento.estado === 'Pago' && (
                        <button
                          disabled={acaoId === pagamento.id}
                          onClick={() => confirmarEstorno(pagamento.id)}
                          style={{
                            ...botaoStyle,
                            background: '#fee2e2',
                            color: '#b91c1c'
                          }}
                        >
                          {acaoId === pagamento.id ? 'A processar...' : 'Estornar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Pagamentos;
