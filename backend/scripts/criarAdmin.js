import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import db from '../db.js';

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

async function criarAdmin() {
  try {
    console.log('\n=== CRIAR ADMINISTRADOR HOTELMANAGER ===\n');

    const nome = (await rl.question('Nome do administrador: ')).trim();

    const email = (
      await rl.question('Email: ')
    ).trim().toLowerCase();

    const senha = await rl.question('Palavra-passe: ');

    if (!nome || !email || senha.length < 8) {
      console.log(
        '\nPreencha todos os campos. A palavra-passe deve ter pelo menos 8 caracteres.'
      );
      return;
    }

    const [existentes] = await db.query(
      'SELECT id FROM utilizadores WHERE email = ?',
      [email]
    );

    if (existentes.length > 0) {
      console.log('\nJá existe um utilizador com esse email.');
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await db.query(
      `INSERT INTO utilizadores
       (nome, email, senha, perfil, estado)
       VALUES (?, ?, ?, 'Administrador', 'Ativo')`,
      [nome, email, senhaHash]
    );

    console.log('\nAdministrador criado com sucesso!');

  } catch (error) {
    console.error('\nErro ao criar administrador:', error.message);
  } finally {
    rl.close();
    await db.end();
  }
}

criarAdmin();
