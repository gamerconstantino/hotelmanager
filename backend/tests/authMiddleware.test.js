import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'hotelmanager-test-secret';

const { default: authMiddleware } = await import('../middleware/authMiddleware.js');

function responseMock() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('rejeita pedidos sem token', () => {
  const res = responseMock();
  let chamouNext = false;

  authMiddleware({ headers: {} }, res, () => {
    chamouNext = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(chamouNext, false);
});

test('rejeita token inválido ou expirado', () => {
  const res = responseMock();
  const req = { headers: { authorization: 'Bearer token-invalido' } };
  let chamouNext = false;

  authMiddleware(req, res, () => {
    chamouNext = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(chamouNext, false);

  const tokenExpirado = jwt.sign(
    { id: 7, perfil: 'Recepcionista' },
    process.env.JWT_SECRET,
    { expiresIn: '-1s' }
  );
  const resExpirado = responseMock();

  authMiddleware(
    { headers: { authorization: 'Bearer ' + tokenExpirado } },
    resExpirado,
    () => {
      chamouNext = true;
    }
  );

  assert.equal(resExpirado.statusCode, 401);
  assert.equal(chamouNext, false);
});

test('aceita token válido e anexa o utilizador ao pedido', () => {
  const token = jwt.sign(
    { id: 7, nome: 'Utilizador de teste', perfil: 'Administrador' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const req = { headers: { authorization: 'Bearer ' + token } };
  const res = responseMock();
  let chamouNext = false;

  authMiddleware(req, res, () => {
    chamouNext = true;
  });

  assert.equal(chamouNext, true);
  assert.equal(req.utilizador.id, 7);
  assert.equal(req.utilizador.perfil, 'Administrador');
  assert.equal(res.statusCode, null);
});
