
import { useState, useEffect } from 'react';

import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  UserCog,
  CreditCard,
  BarChart3,
  Menu,
  X,
  Hotel,
  LogOut,
  RefreshCw
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import Quartos from './pages/Quartos.jsx';
import Hospedes from './pages/Hospedes.jsx';
import Reservas from './pages/Reservas.jsx';
import Funcionarios from './pages/Funcionarios.jsx';
import Pagamentos from './pages/Pagamentos.jsx';
import RelatoriosTemp from './pages/RelatoriosTemp.jsx';
import Utilizadores from './pages/Utilizadores.jsx';
import Login from './pages/Login.jsx';

import { verificarSessao } from './services/authService.js';
import { obterDashboard } from './services/dashboardService.js';

// ======================================================
// MENU PRINCIPAL
// ======================================================

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quartos', label: 'Quartos', icon: BedDouble },
  { id: 'hospedes', label: 'Hóspedes', icon: Users },
  { id: 'reservas', label: 'Reservas', icon: CalendarDays },
  { id: 'funcionarios', label: 'Funcionários', icon: UserCog },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 }
];

// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const [periodo, setPeriodo] = useState('7dias');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 2
    }).format(Number(valor || 0));

  const carregarDados = async (
    periodoSelecionado = periodo,
    inicio = dataInicio,
    fim = dataFim
  ) => {
    if (
      periodoSelecionado === 'personalizado' &&
      (!inicio || !fim)
    ) {
      setErro('Seleciona a data inicial e a data final.');
      return;
    }

    if (
      periodoSelecionado === 'personalizado' &&
      inicio > fim
    ) {
      setErro('A data inicial não pode ser posterior à data final.');
      return;
    }

    try {
      setAtualizando(true);
      setErro('');

      const resultado = await obterDashboard({
        periodo: periodoSelecionado,
        data_inicio: inicio,
        data_fim: fim
      });

      setDados(resultado);
    } catch (error) {
      setErro(error.message || 'Erro ao carregar o Dashboard.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarDados('7dias', '', '');
  }, []);

  const receitasGrafico = (dados?.receitas_diarias || []).map(
    (item) => ({
      data: item.data
        ? new Date(item.data).toLocaleDateString('pt-AO', {
            day: '2-digit',
            month: '2-digit'
          })
        : '',
      total: Number(item.total || 0)
    })
  );

  const reservasGrafico = (
    dados?.reservas_por_estado || []
  ).map((item) => ({
    estado: item.estado,
    quantidade: Number(item.quantidade || 0)
  }));

  const coresGrafico = [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#dc2626',
    '#9333ea'
  ];

  const aplicarPeriodo = (novoPeriodo) => {
    setPeriodo(novoPeriodo);

    if (novoPeriodo !== 'personalizado') {
      setDataInicio('');
      setDataFim('');
      carregarDados(novoPeriodo, '', '');
    }
  };

  return (
    <div className="dashboard-container">

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da gestão do hotel</p>
        </div>

        <button
          className="btn-refresh"
          onClick={() => carregarDados()}
          disabled={atualizando}
        >
          <RefreshCw size={17} />
          {atualizando ? 'A atualizar...' : 'Atualizar'}
        </button>
      </div>

      <div className="dashboard-filters">
        <div className="filter-buttons">
          <button
            className={periodo === 'hoje' ? 'active' : ''}
            onClick={() => aplicarPeriodo('hoje')}
          >
            Hoje
          </button>

          <button
            className={periodo === '7dias' ? 'active' : ''}
            onClick={() => aplicarPeriodo('7dias')}
          >
            Últimos 7 dias
          </button>

          <button
            className={periodo === '30dias' ? 'active' : ''}
            onClick={() => aplicarPeriodo('30dias')}
          >
            Últimos 30 dias
          </button>

          <button
            className={periodo === 'personalizado' ? 'active' : ''}
            onClick={() => setPeriodo('personalizado')}
          >
            Personalizado
          </button>
        </div>

        {periodo === 'personalizado' && (
          <div className="custom-date-filter">
            <div>
              <label>Data inicial</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div>
              <label>Data final</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            <button
              onClick={() => carregarDados(
                'personalizado',
                dataInicio,
                dataFim
              )}
            >
              Aplicar período
            </button>
          </div>
        )}
      </div>

      {erro && (
        <div className="dashboard-error">
          <p>{erro}</p>
          <button onClick={() => carregarDados()}>
            Tentar novamente
          </button>
        </div>
      )}

      {carregando ? (
        <div className="dashboard-loading">
          A carregar os dados...
        </div>
      ) : dados && (
        <>
          <div className="dashboard-cards">

            <div className="stat-card">
              <div className="stat-icon blue">
                <BedDouble size={24} />
              </div>
              <div>
                <p>Total de quartos</p>
                <h2>{dados.quartos?.total || 0}</h2>
                <span>{dados.quartos?.disponiveis || 0} disponíveis</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={24} />
              </div>
              <div>
                <p>Total de hóspedes</p>
                <h2>{dados.hospedes?.total || 0}</h2>
                <span>Registados no sistema</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <CalendarDays size={24} />
              </div>
              <div>
                <p>Reservas no período</p>
                <h2>{dados.reservas?.total || 0}</h2>
                <span>Conforme o período selecionado</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <CreditCard size={24} />
              </div>
              <div>
                <p>Receitas recebidas</p>
                <h2>{formatarMoeda(dados.financeiro?.recebido)}</h2>
                <span>Pagamentos confirmados</span>
              </div>
            </div>

          </div>

          <div className="dashboard-panels">

            <div className="dashboard-panel">
              <h3>Receitas diárias</h3>
              <p>Evolução dos pagamentos recebidos</p>

              {receitasGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={receitasGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip
                      formatter={(valor) => formatarMoeda(valor)}
                    />
                    <Bar
                      dataKey="total"
                      fill="#2563eb"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="empty-chart">
                  Sem receitas neste período.
                </p>
              )}
            </div>

            <div className="dashboard-panel">
              <h3>Reservas por estado</h3>
              <p>Distribuição das reservas</p>

              {reservasGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reservasGrafico}
                      dataKey="quantidade"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {reservasGrafico.map((item, index) => (
                        <Cell
                          key={`${item.estado}-${index}`}
                          fill={coresGrafico[
                            index % coresGrafico.length
                          ]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="empty-chart">
                  Sem reservas neste período.
                </p>
              )}
            </div>

          </div>

          <div className="dashboard-panels">

            <div className="dashboard-panel">
              <h3>Estado dos quartos</h3>

              <div className="room-status">
                <div>
                  <span className="status-dot available"></span>
                  Disponíveis
                  <strong>{dados.quartos?.disponiveis || 0}</strong>
                </div>

                <div>
                  <span className="status-dot occupied"></span>
                  Ocupados
                  <strong>{dados.quartos?.ocupados || 0}</strong>
                </div>

                <div>
                  <span className="status-dot maintenance"></span>
                  Em manutenção
                  <strong>{dados.quartos?.manutencao || 0}</strong>
                </div>
              </div>

              <div className="occupancy-progress">
                <div className="occupancy-progress-header">
                  <span>Taxa de ocupação atual</span>
                  <strong>{dados.ocupacao?.percentual || 0}%</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        dados.ocupacao?.percentual || 0
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <h3>Resumo financeiro</h3>

              <div className="finance-row">
                <span>Recebido</span>
                <strong className="finance-positive">
                  {formatarMoeda(dados.financeiro?.recebido)}
                </strong>
              </div>

              <div className="finance-row">
                <span>Pendente</span>
                <strong>
                  {formatarMoeda(dados.financeiro?.pendente)}
                </strong>
              </div>

              <div className="finance-row">
                <span>Estornado</span>
                <strong className="finance-negative">
                  {formatarMoeda(dados.financeiro?.estornado)}
                </strong>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

// ======================================================
// APLICAÇÃO PRINCIPAL
// ======================================================

function App() {
  const [active, setActive] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);
  const [utilizador, setUtilizador] = useState(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hotelmanager_token');

    if (!token) {
      setVerificandoSessao(false);
      return;
    }

    verificarSessao(token)
      .then((dados) => {
        setUtilizador(dados.utilizador || dados);
      })
      .catch(() => {
        localStorage.removeItem('hotelmanager_token');
        setUtilizador(null);
      })
      .finally(() => {
        setVerificandoSessao(false);
      });
  }, []);

  const terminarSessao = () => {
    localStorage.removeItem('hotelmanager_token');
    setUtilizador(null);
    setActive('dashboard');
  };

  const entrar = (dados) => {
    localStorage.setItem('hotelmanager_token', dados.token);
    setUtilizador(dados.utilizador);
  };

  const renderizarPagina = () => {
    switch (active) {
      case 'dashboard':
        return <Dashboard />;

      case 'quartos':
        return <Quartos />;

      case 'hospedes':
        return <Hospedes />;

      case 'reservas':
        return <Reservas />;

      case 'funcionarios':
        return <Funcionarios />;

      case 'pagamentos':
        return <Pagamentos />;

      case 'relatorios':
        return <RelatoriosTemp />;

      case 'utilizadores':
        return <Utilizadores />;

      default:
        return <Dashboard />;
    }
  };

  if (verificandoSessao) {
    return (
      <div className="dashboard-loading">
        A verificar sessão...
      </div>
    );
  }

  if (!utilizador) {
    return <Login onLogin={entrar} />;
  }

  const nomeUtilizador = utilizador.nome || 'Utilizador';
  const perfil = utilizador.perfil || 'Recepcionista';

  return (
    <div className="app-container">

      {menuAberto && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside className={`sidebar ${menuAberto ? 'open' : ''}`}>

        <div className="brand">
          <div className="brand-icon">
            <Hotel size={25} />
          </div>

          <div>
            <h1>HotelManager</h1>
            <p>Gestão hoteleira</p>
          </div>

          <button
            className="close-menu"
            onClick={() => setMenuAberto(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-heading">MENU PRINCIPAL</p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  active === item.id ? 'active' : ''
                }`}
                onClick={() => {
                  setActive(item.id);
                  setMenuAberto(false);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {perfil === 'Administrador' && (
            <>
              <p className="nav-heading">ADMINISTRAÇÃO</p>

              <button
                className={`nav-item ${
                  active === 'utilizadores' ? 'active' : ''
                }`}
                onClick={() => {
                  setActive('utilizadores');
                  setMenuAberto(false);
                }}
              >
                <UserCog size={20} />
                <span>Utilizadores</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {nomeUtilizador.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{nomeUtilizador}</strong>
              <span>{perfil}</span>
            </div>
          </div>

          <a
            className="portfolio-profile-link"
            href="https://github.com/gamerconstantino"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>ConstantinoCoder · GitHub ↗</span>
          </a>
          <button
            className="logout-button"
            onClick={terminarSessao}
          >
            <LogOut size={18} />
            Terminar sessão
          </button>
        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setMenuAberto(true)}
          >
            <Menu size={23} />
          </button>

          <div className="topbar-title">
            <h2>
              {navItems.find((item) => item.id === active)?.label ||
                (active === 'utilizadores' ? 'Utilizadores' : 'Dashboard')}
            </h2>
          </div>

          <div className="topbar-user">
            <span>{nomeUtilizador}</span>
          </div>
        </header>

        <div className="page-content">
          {renderizarPagina()}
        </div>

      </main>

    </div>
  );
}

export default App;


