


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import quartosRoutes from './routes/quartos.js';
import hospedesRoutes from './routes/hospedes.js';
import reservasRoutes from './routes/reservas.js';
import funcionariosRoutes from './routes/funcionarios.js';
import pagamentosRoutes from './routes/pagamentos.js';
import relatoriosRoutes from './routes/relatorios.js';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/authMiddleware.js';
import utilizadoresRoutes from './routes/utilizadores.js';
import adminMiddleware from './middleware/adminMiddleware.js';
import checkinCheckoutRoutes from './routes/checkinCheckout.js';

console.log('IMPORTAÇÃO CHECK-IN: OK');
console.log('TIPO DA ROTA:', typeof checkinCheckoutRoutes);
console.log('MÉTODOS DA ROTA:', Object.keys(checkinCheckoutRoutes));


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// ==================================
// ROTAS PÚBLICAS
// ==================================
// LOGIN E AUTENTICAÇÃO
app.use('/api/auth', authRoutes);
// ROTA PRINCIPAL
app.get('/', (req, res) => {
  res.json({
    message: 'HotelManager API está funcionando!'
  });
});
// ==================================
// ROTAS PROTEGIDAS
// EXIGEM TOKEN JWT
// ==================================
app.use('/api/quartos', authMiddleware, quartosRoutes);
app.use('/api/hospedes', authMiddleware, hospedesRoutes);
app.use('/api/reservas', authMiddleware, reservasRoutes);
app.use('/api/funcionarios', authMiddleware, funcionariosRoutes);
app.use('/api/pagamentos', authMiddleware, pagamentosRoutes);
app.use('/api/relatorios', authMiddleware, relatoriosRoutes);
app.use('/api/utilizadores', authMiddleware, adminMiddleware, utilizadoresRoutes);
app.use('/api/estadia', authMiddleware, checkinCheckoutRoutes);



// ==================================
// ROTAS DE TESTE PROTEGIDAS
// ==================================
app.get('/api/teste', authMiddleware, (req, res) => {
  res.json({
    message: 'API protegida e autenticação funcionando!',
    utilizador: req.utilizador
  });
});
// TESTAR LIGAÇÃO AO MYSQL
app.get('/api/db-test', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DATABASE() AS database_name'
    );
    res.json({
      status: 'success',
      message: 'Ligação ao MySQL estabelecida!',
      database: rows[0].database_name
    });
  } catch (error) {
    console.error('Erro na ligação MySQL:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Não foi possível ligar à base de dados.'
    });
  }
});
// ==================================
// INICIAR SERVIDOR
// ==================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
  console.log('Rotas públicas e protegidas registadas!');
});