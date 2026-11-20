


import { useEffect, useState } from 'react';
import {
  RefreshCw,
  CalendarDays,
  Wallet,
  Clock,
  RotateCcw,
  BedDouble,
  Users,
  ClipboardList,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { buscarRelatorios } from '../services/relatoriosService.js';
const moeda = (valor) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 2
  }).format(Number(valor || 0));
const dataFormatada = (data) => {
  if (!data) return '-';
  const valor = String(data).slice(0, 10);
  const partes = valor.split('-');
  if (partes.length !== 3) return valor;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};
const estilos = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%'
  },
  cabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  titulo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px'
  },
  subtitulo: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0
  },
  botao: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer'
  },
  secaoTitulo: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 15px'
  },
  painel: {
    background: '#fff',
    padding: '22px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
  },
  grelha: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '16px'
  },
  campo: {
    width: '100%',
    padding: '11px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxSizing: 'border-box',
    background: '#fff',
    color: '#334155'
  },
  etiqueta: {
    display: 'block',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '7px'
  }
};
function Cartao({ titulo, valor, descricao, cor, icon: Icon }) {
  const cores = {
    blue: { fundo: '#eff6ff', texto: '#2563eb', borda: '#3b82f6' },
    green: { fundo: '#f0fdf4', texto: '#16a34a', borda: '#22c55e' },
    yellow: { fundo: '#fefce8', texto: '#ca8a04', borda: '#eab308' },
    red: { fundo: '#fef2f2', texto: '#dc2626', borda: '#ef4444' },
    purple: { fundo: '#faf5ff', texto: '#9333ea', borda: '#a855f7' }
  };
  const tema = cores[cor] || cores.blue;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${tema.borda}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          {titulo}
        </p>
        {Icon && (
          <div style={{
            background: tema.fundo,
            color: tema.texto,
            padding: '9px',
            borderRadius: '9px'
          }}>
            <Icon size={21} />
          </div>
        )}
      </div>
      <h3 style={{
        fontSize: '23px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '15px 0 7px',
        overflowWrap: 'anywhere'
      }}>
        {valor}
      </h3>
      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
        {descricao}
      </p>
    </div>
  );
}
export default function RelatoriosTemp() {
  const [relatorio, setRelatorio] = useState(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  async function carregarRelatorios(inicio = '', fim = '') {
    try {
      setCarregando(true);
      setErro('');
      const resultado = await buscarRelatorios(inicio, fim);
      setRelatorio(resultado);
    } catch (error) {
      console.error('Erro nos relatórios:', error);
      setErro(
        error.message || 'Não foi possível carregar os relatórios.'
      );
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    carregarRelatorios('', '');
  }, []);
  function aplicarFiltros(e) {
    e.preventDefault();
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErro('A data inicial não pode ser posterior à data final.');
      return;
    }
    carregarRelatorios(dataInicio, dataFim);
  }
  function limparFiltros() {
    setDataInicio('');
    setDataFim('');
    carregarRelatorios('', '');
  }
  const financeiro = relatorio?.financeiro || {};
  const reservas = relatorio?.reservas || {};
  const quartos = relatorio?.quartos || {};
  const hospedes = relatorio?.hospedes || {};
  const receitasDiarias = relatorio?.receitas_diarias || [];
  const reservasPorEstado = reservas.por_estado || [];
  const maiorReceita = Math.max(
    1,
    ...receitasDiarias.map((item) => Number(item.total || 0))
  );
  if (carregando && !relatorio) {
    return (
      <div style={{ ...estilos.painel, textAlign: 'center', padding: '50px' }}>
        <RefreshCw size={30} color="#2563eb" />
        <p>A carregar relatórios...</p>
      </div>
    );
  }
  if (erro && !relatorio) {
    return (
      <div style={estilos.painel}>
        <AlertCircle color="#dc2626" size={30} />
        <p style={{ color: '#dc2626' }}>{erro}</p>
        <button
          style={estilos.botao}
          onClick={() => carregarRelatorios(dataInicio, dataFim)}
        >
          <RefreshCw size={17} />
          Tentar novamente
        </button>
      </div>
    );
  }
  return (
    <div style={estilos.container}>
      {/* Cabeçalho */}
      <div style={estilos.cabecalho}>
        <div>
          <h2 style={estilos.titulo}>Relatórios do Hotel</h2>
          <p style={estilos.subtitulo}>
            Acompanhamento financeiro e operacional
          </p>
        </div>
        <button
          style={{
            ...estilos.botao,
            opacity: carregando ? 0.6 : 1
          }}
          onClick={() => carregarRelatorios(dataInicio, dataFim)}
          disabled={carregando}
        >
          <RefreshCw size={17} />
          {carregando ? 'A atualizar...' : 'Atualizar dados'}
        </button>
      </div>
      {erro && (
        <div style={{
          background: '#fef2f2',
          color: '#b91c1c',
          padding: '13px',
          borderRadius: '8px'
        }}>
          {erro}
        </div>
      )}
      {/* Filtros */}
      <form onSubmit={aplicarFiltros} style={estilos.painel}>
        <h3 style={estilos.secaoTitulo}>
          <CalendarDays size={19} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Filtrar por período
        </h3>
        <div style={estilos.grelha}>
          <div>
            <label style={estilos.etiqueta}>Data inicial</label>
            <input
              type="date"
              style={estilos.campo}
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label style={estilos.etiqueta}>Data final</label>
            <input
              type="date"
              style={estilos.campo}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: '9px'
          }}>
            <button
              type="submit"
              style={{ ...estilos.botao, flex: 1 }}
              disabled={carregando}
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={limparFiltros}
              style={{
                ...estilos.botao,
                flex: 1,
                background: '#e2e8f0',
                color: '#334155'
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      </form>
      {/* Resumo financeiro */}
      <section>
        <h3 style={estilos.secaoTitulo}>Resumo financeiro</h3>
        <div style={estilos.grelha}>
          <Cartao
            titulo="Total recebido"
            valor={moeda(financeiro.recebido)}
            descricao="Pagamentos recebidos"
            cor="green"
            icon={Wallet}
          />
          <Cartao
            titulo="Pagamentos pendentes"
            valor={moeda(financeiro.pendente)}
            descricao="Valores ainda pendentes"
            cor="yellow"
            icon={Clock}
          />
          <Cartao
            titulo="Pagamentos estornados"
            valor={moeda(financeiro.estornado)}
            descricao="Valores estornados"
            cor="red"
            icon={RotateCcw}
          />
        </div>
      </section>
      {/* Resumo operacional */}
      <section>
        <h3 style={estilos.secaoTitulo}>Resumo operacional</h3>
        <div style={estilos.grelha}>
          <Cartao
            titulo="Total de reservas"
            valor={reservas.total ?? 0}
            descricao="Reservas registadas"
            cor="blue"
            icon={ClipboardList}
          />
          <Cartao
            titulo="Total de quartos"
            valor={quartos.total ?? 0}
            descricao="Quartos cadastrados"
            cor="purple"
            icon={BedDouble}
          />
          <Cartao
            titulo="Quartos disponíveis"
            valor={quartos.disponiveis ?? 0}
            descricao="Prontos para receber hóspedes"
            cor="green"
            icon={BedDouble}
          />
          <Cartao
            titulo="Total de hóspedes"
            valor={hospedes.total ?? 0}
            descricao="Hóspedes registados"
            cor="blue"
            icon={Users}
          />
        </div>
      </section>
      {/* Estado dos quartos */}
      <section style={estilos.painel}>
        <h3 style={estilos.secaoTitulo}>Estado dos quartos</h3>
        <div style={estilos.grelha}>
          {[
            {
              nome: 'Disponíveis',
              valor: quartos.disponiveis,
              cor: '#16a34a',
              fundo: '#f0fdf4'
            },
            {
              nome: 'Ocupados',
              valor: quartos.ocupados,
              cor: '#dc2626',
              fundo: '#fef2f2'
            },
            {
              nome: 'Em manutenção',
              valor: quartos.manutencao,
              cor: '#ca8a04',
              fundo: '#fefce8'
            }
          ].map((item) => (
            <div
              key={item.nome}
              style={{
                background: item.fundo,
                padding: '18px',
                borderRadius: '10px'
              }}
            >
              <p style={{ color: item.cor, margin: 0, fontSize: '14px' }}>
                {item.nome}
              </p>
              <h3 style={{
                color: item.cor,
                fontSize: '27px',
                margin: '10px 0 0'
              }}>
                {item.valor ?? 0}
              </h3>
            </div>
          ))}
        </div>
      </section>
      {/* Reservas por estado */}
      <section style={estilos.painel}>
        <h3 style={estilos.secaoTitulo}>Reservas por estado</h3>
        {reservasPorEstado.length === 0 ? (
          <p style={estilos.subtitulo}>
            Não existem dados de reservas para apresentar.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reservasPorEstado.map((item, index) => (
              <div
                key={item.estado || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <span style={{ color: '#475569' }}>
                  {item.estado}
                </span>
                <strong style={{ color: '#1e293b' }}>
                  {item.quantidade}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Receitas diárias */}
      <section style={estilos.painel}>
        <h3 style={estilos.secaoTitulo}>
          <TrendingUp size={19} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Receitas diárias
        </h3>
        {receitasDiarias.length === 0 ? (
          <p style={estilos.subtitulo}>
            Não existem receitas para apresentar neste período.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {receitasDiarias.map((item, index) => {
              const total = Number(item.total || 0);
              const largura = (total / maiorReceita) * 100;
              return (
                <div key={item.data || index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      {dataFormatada(item.data)}
                    </span>
                    <strong style={{ color: '#1e293b', fontSize: '14px' }}>
                      {moeda(total)}
                    </strong>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: '#f1f5f9',
                    borderRadius: '20px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${largura}%`,
                        height: '100%',
                        background: '#2563eb',
                        borderRadius: '20px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* Período consultado */}
      {relatorio?.periodo && (
        <p style={{
          textAlign: 'right',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          Período consultado: {dataFormatada(relatorio.periodo.data_inicio)}
          {' até '}
          {dataFormatada(relatorio.periodo.data_fim)}
        </p>
      )}
    </div>
  );
}