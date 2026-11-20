import { useState } from 'react';
import { Hotel, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { fazerLogin } from '../services/authService.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function submeter(e) {
    e.preventDefault();

    try {
      setCarregando(true);
      setErro('');

      const resultado = await fazerLogin(email, senha);

      onLogin(resultado);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: '#f1f5f9'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        padding: '35px',
        borderRadius: '16px',
        boxShadow: '0 10px 35px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            background: '#2563eb',
            color: '#fff',
            width: '65px',
            height: '65px',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px'
          }}>
            <Hotel size={34} />
          </div>

          <h1 style={{ color: '#1e293b', margin: 0 }}>
            HotelManager
          </h1>

          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Entre na sua conta para continuar
          </p>
        </div>

        <form onSubmit={submeter}>
          <label style={{
            display: 'block',
            marginBottom: '7px',
            color: '#334155',
            fontSize: '14px'
          }}>
            Email
          </label>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 12px',
            marginBottom: '20px'
          }}>
            <Mail size={18} color="#64748b" />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hotelmanager.com"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '13px',
                fontSize: '14px'
              }}
            />
          </div>

          <label style={{
            display: 'block',
            marginBottom: '7px',
            color: '#334155',
            fontSize: '14px'
          }}>
            Palavra-passe
          </label>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 12px',
            marginBottom: '20px'
          }}>
            <Lock size={18} color="#64748b" />

            <input
              type={mostrarSenha ? 'text' : 'password'}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Introduza a sua palavra-passe"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '13px',
                fontSize: '14px'
              }}
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#64748b'
              }}
              aria-label={mostrarSenha ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
            >
              {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {erro && (
            <p style={{
              color: '#dc2626',
              background: '#fef2f2',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              background: '#2563eb',
              color: '#fff',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: carregando ? 0.6 : 1
            }}
          >
            {carregando ? 'A entrar...' : 'Iniciar sessão'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '25px'
        }}>
          HotelManager © 2026
        </p>
      </div>
    </div>
  );
}
