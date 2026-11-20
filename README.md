# HotelManager

Projecto de portefólio de [ConstantinoCoder](https://github.com/gamerconstantino).

Sistema web de gestão hoteleira para pequenas unidades. A aplicação tem uma interface React e uma API Node.js ligada a MySQL.

## Funcionalidades

- Dashboard com indicadores de ocupação, reservas e pagamentos.
- Gestão de quartos e hóspedes.
- Criação e acompanhamento de reservas, incluindo check-in e check-out.
- Gestão de funcionários e utilizadores com perfis de acesso.
- Registo, confirmação e estorno de pagamentos.
- Relatórios operacionais e financeiros.
- Autenticação com JWT.

## Tecnologias

- React, Vite e JavaScript
- Node.js e Express
- MySQL e mysql2
- JWT e bcryptjs
- Lucide React e Recharts

## Requisitos

- Node.js e npm
- MySQL

## Preparar a base de dados

1. Crie ou seleccione uma base de dados MySQL para o HotelManager.
2. Execute backend/database/schema.sql nessa base, por exemplo através do MySQL Workbench.
3. Copie backend/.env.example para backend/.env e preencha os dados da base e um valor secreto forte para JWT_SECRET.

O esquema usa CREATE TABLE IF NOT EXISTS: cria tabelas ausentes e não apaga nem altera as existentes. Antes de o usar numa base já preenchida, compare o esquema com as tabelas actuais.

## Executar localmente

1. Na raiz do projecto, execute npm install e depois npm run dev.
2. Na pasta backend, execute npm install e depois npm run dev.
3. Depois de preparar a base de dados, crie o primeiro administrador com node scripts/criarAdmin.js, executado a partir da pasta backend.
4. A interface local comunica com a API em http://localhost:5000.

Para gerar a versão de produção da interface, execute npm run build na raiz.

## Testes

Na pasta backend, execute npm test. Actualmente existem seis testes para os middlewares de autenticação e permissões de administrador. Os fluxos ligados a MySQL ainda precisam de testes de integração.

## Documentação da API

Consulte backend/API.md para ver as rotas, autenticação, filtros e campos de entrada.

## GitHub como portefólio

Este repositório apresenta o projecto de portefólio HotelManager de ConstantinoCoder.

- Repositório: [HotelManager](https://github.com/gamerconstantino/hotelmanager).
- Perfil: [ConstantinoCoder](https://github.com/gamerconstantino).

O ficheiro `.gitignore` exclui credenciais locais, dependências instaladas e ficheiros de compilação. `backend/.env.example` contém apenas valores de exemplo. Não inclua ficheiros `.env` nem dados reais de hóspedes. O GitHub Pages serve a interface estática; para executar o sistema completo, também é necessário alojar a API e a base MySQL.

## Próximas etapas

- Completar os testes de integração da API com MySQL.
- Preparar a configuração de produção para a API e a base de dados.
- Adicionar capturas de ecrã do sistema ao README.

