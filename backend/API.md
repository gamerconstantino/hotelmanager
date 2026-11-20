# HotelManager API

Documentação das rotas actualmente registadas no backend. As respostas são JSON. A API local usa, por padrão, http://localhost:5000.

## Autenticação

As rotas de dados exigem um token JWT no cabeçalho Authorization:

Authorization: Bearer <token>

O token é obtido em POST /api/auth/login e expira após 8 horas. Envie application/json nas requisições com corpo.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /api/auth/login | Público | Inicia sessão. Corpo: email, senha. |
| GET | /api/auth/me | Autenticado | Devolve os dados do utilizador da sessão. |

As rotas de /api/utilizadores exigem perfil Administrador. Sem token válido, a API responde 401; sem perfil de administrador numa rota restrita, responde 403.

## Quartos

Todas as rotas abaixo exigem autenticação.

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/quartos | Lista quartos. |
| POST | /api/quartos | Cria quarto. Corpo: numero, tipo, capacidade, preco_diaria, estado, descricao. numero, tipo e preco_diaria são obrigatórios. |
| PUT | /api/quartos/:id | Actualiza quarto com os mesmos campos de criação. |
| DELETE | /api/quartos/:id | Remove quarto. |

## Hóspedes

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/hospedes?q=texto | Lista hóspedes; q filtra a pesquisa. |
| GET | /api/hospedes/:id | Consulta um hóspede. |
| POST | /api/hospedes | Cria hóspede. Corpo: nome_completo, documento, telefone, email, endereco. Nome, documento e telefone são obrigatórios. |
| PUT | /api/hospedes/:id | Actualiza os dados do hóspede. |
| DELETE | /api/hospedes/:id | Remove hóspede. |

## Reservas e estadias

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/reservas?q=texto&estado=estado | Lista reservas com filtros opcionais. |
| GET | /api/reservas/opcoes | Devolve opções usadas na criação de reservas. |
| POST | /api/reservas | Cria reserva. Corpo: hospede_id, quarto_id, data_checkin, data_checkout, numero_hospedes, observacoes. |
| PUT | /api/reservas/:id | Actualiza reserva. Corpo: hospede_id, quarto_id, data_checkin, data_checkout, numero_hospedes, estado, observacoes. |
| PATCH | /api/reservas/:id/cancelar | Cancela reserva. |
| PATCH | /api/estadia/:id/checkin | Regista a entrada associada à reserva. |
| PATCH | /api/estadia/:id/checkout | Regista a saída associada à reserva. |

As datas de reserva devem ser enviadas no formato YYYY-MM-DD.

## Funcionários

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/funcionarios?q=texto | Lista funcionários; q filtra a pesquisa. |
| POST | /api/funcionarios | Cria funcionário. Corpo: nome_completo, telefone, email, cargo, estado. Nome, telefone e cargo são obrigatórios. |
| PUT | /api/funcionarios/:id | Actualiza funcionário. |
| DELETE | /api/funcionarios/:id | Remove funcionário. |

## Pagamentos

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/pagamentos?q=texto&estado=estado&data_inicio=AAAA-MM-DD&data_fim=AAAA-MM-DD | Lista pagamentos com filtros opcionais. |
| GET | /api/pagamentos/opcoes | Devolve reservas e opções para registar pagamentos. |
| POST | /api/pagamentos | Regista pagamento. Corpo: reserva_id, valor, metodo, estado, referencia. estado é opcional e assume Pago. |
| PATCH | /api/pagamentos/:id/confirmar | Confirma pagamento pendente. |
| PATCH | /api/pagamentos/:id/estornar | Estorna pagamento. |

Os métodos aceites são Dinheiro, Multicaixa, Transferencia e Outro. Os estados usados pela API são Pendente, Pago e Estornado. A criação aceita os estados Pago ou Pendente.

## Relatórios

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/relatorios/dashboard?periodo=7dias | Devolve indicadores e séries do dashboard. |
| GET | /api/relatorios/resumo?data_inicio=AAAA-MM-DD&data_fim=AAAA-MM-DD | Devolve resumo financeiro e operacional. |

No dashboard, periodo aceita hoje, 7dias, 30dias ou personalizado. Para personalizado, envie data_inicio e data_fim no formato YYYY-MM-DD.

## Utilizadores

Estas rotas exigem autenticação e perfil Administrador.

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/utilizadores | Lista utilizadores. |
| POST | /api/utilizadores | Cria utilizador. Corpo: nome, email, senha, perfil. |
| PUT | /api/utilizadores/:id | Actualiza utilizador. Corpo: nome, email, senha, perfil, estado. |

Os perfis aceites são Administrador e Recepcionista. Ao actualizar, senha pode ser omitida se não for alterada.

## Saúde da API e diagnóstico

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | / | Público | Confirma que a API está activa. |
| GET | /api/teste | Autenticado | Verifica autenticação e devolve o utilizador da sessão. |
| GET | /api/db-test | Autenticado | Verifica a ligação à base de dados. |

## Erros

As respostas de erro incluem uma propriedade message. Os códigos mais comuns são 400 para dados inválidos, 401 para sessão ausente ou inválida, 403 para falta de permissões, 404 para registos não encontrados e 500 para erro interno.
