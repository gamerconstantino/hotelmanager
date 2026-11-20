# HotelManager

**Portfolio project by [ConstantinoCoder](https://github.com/gamerconstantino).**

[English](#hotelmanager) · [Português](#portugues)

HotelManager is a web application for managing day-to-day operations at a small hotel. It combines a React frontend with a Node.js and Express API connected to MySQL.

This project is part of my development portfolio. There is no hosted live demo yet. The full application requires the frontend, API, and MySQL database to be running.

## Features

- Dashboard with occupancy, reservation, and payment metrics.
- Room and guest management.
- Reservation workflows, including check-in and check-out.
- Staff and user management with Administrator and Receptionist roles.
- Payment recording, confirmation, and reversal.
- Operational and financial reports.
- JWT-based authentication.

## Technology

- Frontend: React, Vite, JavaScript, Lucide React, and Recharts.
- Backend: Node.js and Express.
- Database: MySQL with mysql2.
- Authentication: JSON Web Tokens and bcryptjs.

## Run locally

### Requirements

- Node.js and npm.
- MySQL.

### 1. Prepare the database

Create or select a MySQL database for HotelManager and run `backend/database/schema.sql` against it. The schema uses `CREATE TABLE IF NOT EXISTS`; review it before using it with an existing database.

### 2. Configure the backend

From the `backend` folder, copy `.env.example` to `.env`. Set your local database values and a strong `JWT_SECRET`. The example file contains placeholders only. Do not commit your local `.env` file or real guest data.

### 3. Install dependencies

Run these commands from the project root:

```bash
npm install
```

Then run this from the `backend` folder:

```bash
npm install
```

### 4. Start the application

Start the frontend from the project root:

```bash
npm run dev
```

Start the API in a second terminal from the `backend` folder:

```bash
npm run dev
```

The frontend uses the local API at `http://localhost:5000`. After preparing the database, create the first administrator from the `backend` folder:

```bash
node scripts/criarAdmin.js
```

To build the frontend for production, run `npm run build` from the project root.

## Tests

Run the backend tests from the `backend` folder:

```bash
npm test
```

The MySQL-backed API flows still need integration tests.

## API documentation

- [English API reference](backend/API.en.md)
- [Referência da API em português](backend/API.md)

## Portfolio links

- [HotelManager repository](https://github.com/gamerconstantino/hotelmanager)
- [ConstantinoCoder on GitHub](https://github.com/gamerconstantino)

## Planned improvements

- Add integration tests for the API with MySQL.
- Prepare production configuration for the API and database.
- Add application screenshots.

---

<a id="portugues"></a>

# HotelManager — Português

**Projecto de portefólio de [ConstantinoCoder](https://github.com/gamerconstantino).**

O HotelManager é uma aplicação web para gerir as operações diárias de uma pequena unidade hoteleira. Combina uma interface React com uma API Node.js e Express ligada a MySQL.

Este projecto faz parte do meu portefólio de desenvolvimento. Ainda não existe uma demonstração alojada. A aplicação completa necessita da interface, da API e da base de dados MySQL em execução.

## Funcionalidades

- Painel com indicadores de ocupação, reservas e pagamentos.
- Gestão de quartos e hóspedes.
- Fluxos de reservas, incluindo check-in e check-out.
- Gestão de funcionários e utilizadores com perfis de Administrador e Recepcionista.
- Registo, confirmação e estorno de pagamentos.
- Relatórios operacionais e financeiros.
- Autenticação com JWT.

## Tecnologias

- Interface: React, Vite, JavaScript, Lucide React e Recharts.
- API: Node.js e Express.
- Base de dados: MySQL com mysql2.
- Autenticação: JSON Web Tokens e bcryptjs.

## Executar localmente

### Requisitos

- Node.js e npm.
- MySQL.

### 1. Preparar a base de dados

Crie ou seleccione uma base de dados MySQL para o HotelManager e execute nela `backend/database/schema.sql`. O esquema usa `CREATE TABLE IF NOT EXISTS`; reveja-o antes de o usar com uma base de dados existente.

### 2. Configurar a API

Na pasta `backend`, copie `.env.example` para `.env`. Preencha os dados locais da base de dados e defina um valor forte para `JWT_SECRET`. O ficheiro de exemplo contém apenas valores de exemplo. Não envie o ficheiro local `.env` nem dados reais de hóspedes para o GitHub.

### 3. Instalar dependências e iniciar

Na raiz, execute `npm install` e `npm run dev`. Noutro terminal, dentro de `backend`, execute `npm install` e `npm run dev`.

A interface usa a API local em `http://localhost:5000`. Depois de preparar a base de dados, crie o primeiro administrador a partir da pasta `backend`:

```bash
node scripts/criarAdmin.js
```

Para gerar a versão de produção da interface, execute `npm run build` na raiz. Para executar os testes do backend, use `npm test` na pasta `backend`.

## Documentação da API

- [Documentação da API em português](backend/API.md)
- [Referência da API em inglês](backend/API.en.md)

## Próximas melhorias

- Adicionar testes de integração da API com MySQL.
- Preparar a configuração de produção para a API e a base de dados.
- Adicionar capturas de ecrã da aplicação.
