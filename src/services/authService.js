


const API_URL = 'http://localhost:5000/api/auth';
// INICIAR SESSÃO
export async function fazerLogin(email, senha) {
  try {
    const resposta = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        senha
      })
    });
    const resultado = await resposta.json();
    if (!resposta.ok) {
      throw new Error(
        resultado.message || 'Email ou palavra-passe incorretos.'
      );
    }
    return resultado;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Não foi possível contactar o servidor. Verifique se o backend está ligado na porta 5000.'
      );
    }
    throw error;
  }
}
// VERIFICAR SESSÃO
export async function verificarSessao(token) {
  try {
    const resposta = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const resultado = await resposta.json();
    if (!resposta.ok) {
      throw new Error(
        resultado.message || 'Sessão inválida ou expirada.'
      );
    }
    return resultado.utilizador;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Não foi possível verificar a sessão.');
    }
    throw error;
  }
}










