import assert from 'node:assert/strict';
import test from 'node:test';
import adminMiddleware from '../middleware/adminMiddleware.js';

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

test('rejeita pedido sem utilizador autenticado', () => {
  const res = responseMock();
  let chamouNext = false;

  adminMiddleware({}, res, () => {
    chamouNext = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(chamouNext, false);
});

test('recusa utilizador sem perfil de administrador', () => {
  const res = responseMock();
  let chamouNext = false;

  adminMiddleware({ utilizador: { perfil: 'Recepcionista' } }, res, () => {
    chamouNext = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(chamouNext, false);
});

test('permite utilizador administrador', () => {
  const res = responseMock();
  let chamouNext = false;

  adminMiddleware({ utilizador: { perfil: 'Administrador' } }, res, () => {
    chamouNext = true;
  });

  assert.equal(chamouNext, true);
  assert.equal(res.statusCode, null);
});
