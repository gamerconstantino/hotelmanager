


import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Users,
  ShieldCheck,
  UserRound,
  X,
  RefreshCw
} from 'lucide-react';
import {
  listarUtilizadores,
  cadastrarUtilizador,
  atualizarUtilizador
} from '../services/utilizadoresService.js';
export default function Utilizadores() {
  const [utilizadores, setUtilizadores] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const formularioInicial = {
    nome: '',
    email: '',
    senha: '',
    perfil: 'Recepcionista',
    estado: 'Ativo'
  };
  const [formulario, setFormulario] = useState(formularioInicial);
  async function carregarUtilizadores() {
    try {
      setCarregando(true);
      setErro('');
      const dados = await listarUtilizadores();
      setUtilizadores(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    carregarUtilizadores();
  }, []);
  function abrirNovo() {
    setEditando(null);
    setFormulario(formularioInicial);
    setMensagem('');
    setErro('');
    setModalAberto(true);
  }
  function abrirEdicao(utilizador) {
    setEditando(utilizador);
    setFormulario({
      nome: utilizador.nome,
      email: utilizador.email,
      senha: '',
      perfil: utilizador.perfil,
      estado: utilizador.estado
    });
    setMensagem('');
    setErro('');
    setModalAberto(true);
  }
  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }
  async function guardarUtilizador(evento) {
    evento.preventDefault();
    try {
      setErro('');
      setMensagem('');
      if (!formulario.nome.trim() || !formulario.email.trim()) {
        setErro('Preencha o nome e o email.');
        return;
      }
      if (!editando && !formulario.senha) {
        setErro('Informe uma palavra-passe.');
        return;
      }
      if (formulario.senha && formulario.senha.length < 6) {
        setErro('A palavra-passe deve ter pelo menos 6 caracteres.');
        return;
      }
      if (editando) {
        const dados = { ...formulario };
        if (!dados.senha) {
          delete dados.senha;
        }
        await atualizarUtilizador(editando.id, dados);
        setMensagem('Utilizador atualizado com sucesso!');
      } else {
        await cadastrarUtilizador(formulario);
        setMensagem('Utilizador criado com sucesso!');
      }
      await carregarUtilizadores();
      setModalAberto(false);
      setFormulario(formularioInicial);
      setEditando(null);
    } catch (error) {
      setErro(error.message);
    }
  }
  const utilizadoresFiltrados = utilizadores.filter((utilizador) =>
    `${utilizador.nome} ${utilizador.email} ${utilizador.perfil}`
      .toLowerCase()
      .includes(pesquisa.toLowerCase())
  );
  const totalAdministradores = utilizadores.filter(
    (u) => u.perfil === 'Administrador'
  ).length;
  const totalRecepcionistas = utilizadores.filter(
    (u) => u.perfil === 'Recepcionista'
  ).length;
  const totalAtivos = utilizadores.filter(
    (u) => u.estado === 'Ativo'
  ).length;
  return (
    <div className="page-content">
      <div style={styles.cabecalho}>
        <div>
          <h2 style={styles.titulo}>Gestão de Utilizadores</h2>
          <p style={styles.subtitulo}>
            Administre as contas e os níveis de acesso ao sistema.
          </p>
        </div>
        <button style={styles.botaoPrincipal} onClick={abrirNovo}>
          <Plus size={18} />
          Novo utilizador
        </button>
      </div>
      {erro && !modalAberto && (
        <div style={styles.erro}>{erro}</div>
      )}
      {mensagem && (
        <div style={styles.sucesso}>{mensagem}</div>
      )}
      <div style={styles.estatisticas}>
        <div style={styles.cartao}>
          <Users size={24} color="#2563eb" />
          <div>
            <strong>{utilizadores.length}</strong>
            <span>Total de utilizadores</span>
          </div>
        </div>
        <div style={styles.cartao}>
          <ShieldCheck size={24} color="#16a34a" />
          <div>
            <strong>{totalAdministradores}</strong>
            <span>Administradores</span>
          </div>
        </div>
        <div style={styles.cartao}>
          <UserRound size={24} color="#9333ea" />
          <div>
            <strong>{totalRecepcionistas}</strong>
            <span>Recepcionistas</span>
          </div>
        </div>
        <div style={styles.cartao}>
          <Users size={24} color="#0891b2" />
          <div>
            <strong>{totalAtivos}</strong>
            <span>Contas ativas</span>
          </div>
        </div>
      </div>
      <div style={styles.painel}>
        <div style={styles.ferramentas}>
          <div style={styles.pesquisa}>
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou perfil..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={styles.inputPesquisa}
            />
          </div>
          <button
            style={styles.botaoAtualizar}
            onClick={carregarUtilizadores}
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
        {carregando ? (
          <p style={styles.aviso}>A carregar utilizadores...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.tabela}>
              <thead>
                <tr>
                  <th>Utilizador</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {utilizadoresFiltrados.map((utilizador) => (
                  <tr key={utilizador.id}>
                    <td>
                      <strong>{utilizador.nome}</strong>
                    </td>
                    <td>{utilizador.email}</td>
                    <td>
                      <span style={{
                        ...styles.etiqueta,
                        background: utilizador.perfil === 'Administrador'
                          ? '#dbeafe'
                          : '#f3e8ff',
                        color: utilizador.perfil === 'Administrador'
                          ? '#1d4ed8'
                          : '#7e22ce'
                      }}>
                        {utilizador.perfil}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        ...styles.etiqueta,
                        background: utilizador.estado === 'Ativo'
                          ? '#dcfce7'
                          : '#fee2e2',
                        color: utilizador.estado === 'Ativo'
                          ? '#15803d'
                          : '#b91c1c'
                      }}>
                        {utilizador.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        style={styles.botaoEditar}
                        onClick={() => abrirEdicao(utilizador)}
                        title="Editar utilizador"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {utilizadoresFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" style={styles.aviso}>
                      Nenhum utilizador encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modalAberto && (
        <div style={styles.fundoModal}>
          <div style={styles.modal}>
            <div style={styles.modalCabecalho}>
              <div>
                <h3>
                  {editando ? 'Editar utilizador' : 'Novo utilizador'}
                </h3>
                <p>Preencha os dados da conta.</p>
              </div>
              <button
                style={styles.botaoFechar}
                onClick={() => setModalAberto(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={guardarUtilizador}>
              <label style={styles.label}>Nome completo</label>
              <input
                style={styles.input}
                name="nome"
                value={formulario.nome}
                onChange={alterarCampo}
                required
              />
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                value={formulario.email}
                onChange={alterarCampo}
                required
              />
              <label style={styles.label}>
                Palavra-passe {editando && '(opcional)'}
              </label>
              <input
                style={styles.input}
                type="password"
                name="senha"
                value={formulario.senha}
                onChange={alterarCampo}
                placeholder={editando ? 'Deixe vazio para manter a atual' : 'Mínimo 6 caracteres'}
                required={!editando}
                minLength={6}
              />
              <label style={styles.label}>Perfil de acesso</label>
              <select
                style={styles.input}
                name="perfil"
                value={formulario.perfil}
                onChange={alterarCampo}
              >
                <option value="Administrador">Administrador</option>
                <option value="Recepcionista">Recepcionista</option>
              </select>
              {editando && (
                <>
                  <label style={styles.label}>Estado da conta</label>
                  <select
                    style={styles.input}
                    name="estado"
                    value={formulario.estado}
                    onChange={alterarCampo}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </>
              )}
              {erro && (
                <div style={styles.erro}>{erro}</div>
              )}
              <div style={styles.acoesModal}>
                <button
                  type="button"
                  style={styles.botaoCancelar}
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.botaoPrincipal}>
                  {editando ? 'Guardar alterações' : 'Criar utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
const styles = {
  cabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24
  },
  titulo: {
    margin: 0,
    fontSize: 24,
    color: 'var(--text-primary, #1e293b)'
  },
  subtitulo: {
    color: '#64748b',
    marginTop: 6
  },
  estatisticas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 24
  },
  cartao: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    background: 'var(--card-bg, white)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: 12
  },
  painel: {
    background: 'var(--card-bg, white)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: 12,
    padding: 20
  },
  ferramentas: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 20
  },
  pesquisa: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '0 12px',
    flex: 1,
    minWidth: 220
  },
  inputPesquisa: {
    border: 'none',
    outline: 'none',
    padding: 12,
    width: '100%',
    background: 'transparent'
  },
  tabela: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    minWidth: 650
  },
  etiqueta: {
    padding: '5px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600
  },
  botaoPrincipal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 16px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer'
  },
  botaoAtualizar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer'
  },
  botaoEditar: {
    padding: 8,
    background: '#eff6ff',
    color: '#2563eb',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  },
  aviso: {
    textAlign: 'center',
    padding: 24,
    color: '#64748b'
  },
  erro: {
    padding: 12,
    background: '#fee2e2',
    color: '#b91c1c',
    borderRadius: 8,
    marginBottom: 12
  },
  sucesso: {
    padding: 12,
    background: '#dcfce7',
    color: '#15803d',
    borderRadius: 8,
    marginBottom: 12
  },
  fundoModal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 1000
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'white',
    borderRadius: 14,
    padding: 24
  },
  modalCabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  botaoFechar: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer'
  },
  label: {
    display: 'block',
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 14,
    color: '#334155'
  },
  input: {
    width: '100%',
    padding: 11,
    border: '1px solid #cbd5e1',
    borderRadius: 7,
    boxSizing: 'border-box'
  },
  acoesModal: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24
  },
  botaoCancelar: {
    padding: '11px 15px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer'
  }
};