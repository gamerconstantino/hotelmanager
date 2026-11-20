# HotelManager API

English reference for the routes registered by the backend. Route paths, request field names, and accepted values remain exactly as the application expects them. Responses are JSON.

- Local API URL: `http://localhost:5000`
- Routes requiring a signed-in user expect a JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

Send `application/json` for requests with a JSON body. A token is returned by `POST /api/auth/login` and expires after 8 hours.

## Authentication

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Sign in. Body: `email`, `senha`. |
| GET | `/api/auth/me` | Authenticated | Return the current user's account details. |

All `/api/utilizadores` routes require the `Administrador` role. A missing or invalid token returns 401; a user without the required administrator role receives 403.

## Rooms

All routes below require authentication.

| Method | Route | Description |
|---|---|---|
| GET | `/api/quartos` | List rooms. |
| POST | `/api/quartos` | Create a room. Body fields: `numero`, `tipo`, `capacidade`, `preco_diaria`, `estado`, `descricao`. Required: `numero`, `tipo`, `preco_diaria`. |
| PUT | `/api/quartos/:id` | Update a room using the same fields as creation. |
| DELETE | `/api/quartos/:id` | Delete a room. |

## Guests

| Method | Route | Description |
|---|---|---|
| GET | `/api/hospedes?q=text` | List guests; the optional `q` parameter filters the search. |
| GET | `/api/hospedes/:id` | Get one guest. |
| POST | `/api/hospedes` | Create a guest. Body fields: `nome_completo`, `documento`, `telefone`, `email`, `endereco`. Required: `nome_completo`, `documento`, `telefone`. |
| PUT | `/api/hospedes/:id` | Update a guest. |
| DELETE | `/api/hospedes/:id` | Delete a guest. |

## Reservations and stays

| Method | Route | Description |
|---|---|---|
| GET | `/api/reservas?q=text&estado=state` | List reservations with optional filters. |
| GET | `/api/reservas/opcoes` | Return options used when creating a reservation. |
| POST | `/api/reservas` | Create a reservation. Body fields: `hospede_id`, `quarto_id`, `data_checkin`, `data_checkout`, `numero_hospedes`, `observacoes`. |
| PUT | `/api/reservas/:id` | Update a reservation. Body fields: `hospede_id`, `quarto_id`, `data_checkin`, `data_checkout`, `numero_hospedes`, `estado`, `observacoes`. |
| PATCH | `/api/reservas/:id/cancelar` | Cancel a reservation. |
| PATCH | `/api/estadia/:id/checkin` | Record check-in for the reservation. |
| PATCH | `/api/estadia/:id/checkout` | Record check-out for the reservation. |

Reservation dates must use the `YYYY-MM-DD` format.

## Staff

| Method | Route | Description |
|---|---|---|
| GET | `/api/funcionarios?q=text` | List staff; the optional `q` parameter filters the search. |
| POST | `/api/funcionarios` | Create a staff record. Body fields: `nome_completo`, `telefone`, `email`, `cargo`, `estado`. Required: `nome_completo`, `telefone`, `cargo`. |
| PUT | `/api/funcionarios/:id` | Update a staff record. |
| DELETE | `/api/funcionarios/:id` | Delete a staff record. |

## Payments

| Method | Route | Description |
|---|---|---|
| GET | `/api/pagamentos?q=text&estado=state&data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD` | List payments with optional filters. |
| GET | `/api/pagamentos/opcoes` | Return reservations and options for recording a payment. |
| POST | `/api/pagamentos` | Record a payment. Body fields: `reserva_id`, `valor`, `metodo`, `estado`, `referencia`. If omitted, `estado` defaults to `Pago`. |
| PATCH | `/api/pagamentos/:id/confirmar` | Confirm a pending payment. |
| PATCH | `/api/pagamentos/:id/estornar` | Reverse a payment. |

Accepted payment methods are `Dinheiro` (cash), `Multicaixa`, `Transferencia` (bank transfer), and `Outro` (other). API payment states are `Pendente`, `Pago`, and `Estornado`. Creation accepts `Pago` or `Pendente`.

## Reports

| Method | Route | Description |
|---|---|---|
| GET | `/api/relatorios/dashboard?periodo=7dias` | Return dashboard metrics and time series. |
| GET | `/api/relatorios/resumo?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD` | Return a financial and operational summary. |

The dashboard `periodo` parameter accepts `hoje`, `7dias`, `30dias`, or `personalizado`. For `personalizado`, send `data_inicio` and `data_fim` in `YYYY-MM-DD` format.

## Users

These routes require authentication and the `Administrador` role.

| Method | Route | Description |
|---|---|---|
| GET | `/api/utilizadores` | List users. |
| POST | `/api/utilizadores` | Create a user. Body: `nome`, `email`, `senha`, `perfil`. |
| PUT | `/api/utilizadores/:id` | Update a user. Body: `nome`, `email`, `senha`, `perfil`, `estado`. |

Accepted roles are `Administrador` and `Recepcionista`. When updating a user, `senha` may be omitted if it is not being changed.

## Health and diagnostics

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Confirm that the API is running. |
| GET | `/api/teste` | Authenticated | Check authentication and return the current user. |
| GET | `/api/db-test` | Authenticated | Check the database connection. |

## Error responses

Error responses include a `message` property. Common status codes are 400 (invalid input), 401 (missing or invalid session), 403 (insufficient permissions), 404 (record not found), and 500 (internal error).

[Back to the project README](../README.md)
