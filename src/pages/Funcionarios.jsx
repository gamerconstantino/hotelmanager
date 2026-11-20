import { useEffect, useState } from 'react';

import {
  listarFuncionarios,
  cadastrarFuncionario,
  atualizarFuncionario,
  eliminarFuncionario
} from '../services/funcionariosService.js';

const formularioInicial = {
  nome_completo: '',
  telefone: '',
  email: '',
  cargo: '',
  estado: 'Ativo'
};

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [pesquisa, setPesquisa] = useState('');
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarFuncionarios() {
    try {
      setCarregando(true);
      setErro('');

      const dados = await listarFuncionarios(pesquisa);
      setFuncionarios(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFuncionarios();
  }, [pesquisa]);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  }

  function abrirNovoFormulario() {
    setEditando(null);
    setFormulario(formularioInicial);
    setErro('');
    setSucesso('');
    setMostrarFormulario(true);
  }

  function editarFuncionario(funcionario) {
    setEditando(funcionario.id);

    setFormulario({
      nome_completo: funcionario.nome_completo || '',
      telefone: funcionario.telefone || '',
      email: funcionario.email || '',
      cargo: funcionario.cargo || '',
      estado: funcionario.estado || 'Ativo'
    });

    setErro('');
    setSucesso('');
    setMostrarFormulario(true);
  }

  async function guardarFuncionario(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro('');
      setSucesso('');

      if (editando) {
        await atualizarFuncionario(editando, formulario);
        setSucesso('Funcionário atualizado com sucesso!');
      } else {
        await cadastrarFuncionario(formulario);
        setSucesso('Funcionário cadastrado com sucesso!');
      }

      setFormulario(formularioInicial);
      setEditando(null);
      setMostrarFormulario(false);

      await carregarFuncionarios();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function apagarFuncionario(id) {
    const confirmar = window.confirm(
      'Tens a certeza de que desejas eliminar este funcionário?'
    );

    if (!confirmar) return;

    try {
      setErro('');
      setSucesso('');

      await eliminarFuncionario(id);

      setSucesso('Funcionário eliminado com sucesso!');
      await carregarFuncionarios();
    } catch (error) {
      setErro(error.message);
    }
  }

  function cancelarFormulario() {
    setMostrarFormulario(false);
    setEditando(null);
    setFormulario(formularioInicial);
    setErro('');
  }

  const totalAtivos = funcionarios.filter(
    (f) => f.estado === 'Ativo'
  ).length;

  const totalInativos = funcionarios.filter(
    (f) => f.estado === 'Inativo'
  ).length;

  const estiloInput = {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #dce2ea',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const estiloBotao = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
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
          <h2 style={{ margin: 0 }}>Funcionários</h2>
          <p style={{ color: '#64748b', marginTop: '7px' }}>
            Gestão e controlo dos funcionários do hotel.
          </p>
        </div>

        <button
          onClick={abrirNovoFormulario}
          style={{
            ...estiloBotao,
            background: '#2563eb',
            color: '#fff'
          }}
        >
          + Novo funcionário
        </button>
      </div>

      {/* MENSAGENS */}
      {erro && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px'
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
          marginBottom: '15px'
        }}>
          {sucesso}
        </div>
      )}

      {/* INDICADORES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', margin: 0 }}>Total de funcionários</p>
          <h2 style={{ marginBottom: 0 }}>{funcionarios.length}</h2>
        </div>

        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', margin: 0 }}>Funcionários ativos</p>
          <h2 style={{ marginBottom: 0, color: '#16a34a' }}>
            {totalAtivos}
          </h2>
        </div>

        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', margin: 0 }}>Funcionários inativos</p>
          <h2 style={{ marginBottom: 0, color: '#dc2626' }}>
            {totalInativos}
          </h2>
        </div>
      </div>

      {/* FORMULÁRIO */}
      {mostrarFormulario && (
        <div style={{
          background: '#fff',
          padding: '22px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '25px'
        }}>
          <h3>
            {editando ? 'Editar funcionário' : 'Cadastrar funcionário'}
          </h3>

          <form onSubmit={guardarFuncionario}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label>Nome completo *</label>
                <input
                  style={estiloInput}
                  name="nome_completo"
                  value={formulario.nome_completo}
                  onChange={alterarCampo}
                  placeholder="Nome do funcionário"
                  required
                />
              </div>

              <div>
                <label>Telefone *</label>
                <input
                  style={estiloInput}
                  name="telefone"
                  value={formulario.telefone}
                  onChange={alterarCampo}
                  placeholder="Número de telefone"
                  required
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  style={estiloInput}
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={alterarCampo}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label>Cargo *</label>
                <input
                  style={estiloInput}
                  name="cargo"
                  value={formulario.cargo}
                  onChange={alterarCampo}
                  placeholder="Ex.: Recepcionista"
                  required
                />
              </div>

              <div>
                <label>Estado</label>
                <select
                  style={estiloInput}
                  name="estado"
                  value={formulario.estado}
                  onChange={alterarCampo}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                type="submit"
                disabled={salvando}
                style={{
                  ...estiloBotao,
                  background: '#2563eb',
                  color: '#fff'
                }}
              >
                {salvando ? 'A guardar...' : 'Guardar funcionário'}
              </button>

              <button
                type="button"
                onClick={cancelarFormulario}
                style={{
                  ...estiloBotao,
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

      {/* PESQUISA */}
      <div style={{ marginBottom: '18px' }}>
        <input
          style={{
            ...estiloInput,
            maxWidth: '420px'
          }}
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar por nome, telefone ou cargo..."
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
          borderCollapse: 'collapse',
          minWidth: '750px'
        }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {['Nome', 'Telefone', 'Email', 'Cargo', 'Estado', 'Ações'].map(
                (titulo) => (
                  <th key={titulo} style={{
                    padding: '14px',
                    textAlign: 'left',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    {titulo}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="6" style={{ padding: '25px', textAlign: 'center' }}>
                  A carregar funcionários...
                </td>
              </tr>
            ) : funcionarios.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '25px', textAlign: 'center' }}>
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            ) : (
              funcionarios.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td style={{ padding: '14px', borderBottom: '1px solid #eee' }}>
                    {funcionario.nome_completo}
                  </td>

                  <td style={{ padding: '14px', borderBottom: '1px solid #eee' }}>
                    {funcionario.telefone}
                  </td>

                  <td style={{ padding: '14px', borderBottom: '1px solid #eee' }}>
                    {funcionario.email || '—'}
                  </td>

                  <td style={{ padding: '14px', borderBottom: '1px solid #eee' }}>
                    {funcionario.cargo}
                  </td>

                  <td style={{ padding: '14px', borderBottom: '1px solid #eee' }}>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      background: funcionario.estado === 'Ativo' ? '#dcfce7' : '#fee2e2',
                      color: funcionario.estado === 'Ativo' ? '#166534' : '#991b1b'
                    }}>
                      {funcionario.estado}
                    </span>
                  </td>

                  <td style={{
                    padding: '14px',
                    borderBottom: '1px solid #eee',
                    whiteSpace: 'nowrap'
                  }}>
                    <button
                      onClick={() => editarFuncionario(funcionario)}
                      style={{
                        ...estiloBotao,
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        marginRight: '7px'
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => apagarFuncionario(funcionario.id)}
                      style={{
                        ...estiloBotao,
                        background: '#fee2e2',
                        color: '#b91c1c'
                      }}
                    >
                      Eliminar
                    </button>
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

export default Funcionarios;