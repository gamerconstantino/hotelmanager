-- HotelManager: esquema inicial MySQL
-- Seleccione primeiro a base de dados indicada por DB_NAME.
-- Este ficheiro cria tabelas que ainda não existem; não apaga nem altera tabelas existentes.

CREATE TABLE IF NOT EXISTS utilizadores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(30) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Ativo',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_utilizadores_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quartos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero VARCHAR(30) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  capacidade SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  preco_diaria DECIMAL(12,2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Disponivel',
  descricao TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quartos_numero (numero),
  KEY idx_quartos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hospedes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome_completo VARCHAR(180) NOT NULL,
  documento VARCHAR(100) NOT NULL,
  telefone VARCHAR(40) NOT NULL,
  email VARCHAR(191) NULL,
  endereco VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hospedes_documento (documento),
  KEY idx_hospedes_nome (nome_completo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS funcionarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome_completo VARCHAR(180) NOT NULL,
  telefone VARCHAR(40) NOT NULL,
  email VARCHAR(191) NULL,
  cargo VARCHAR(100) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Ativo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_funcionarios_nome (nome_completo),
  KEY idx_funcionarios_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  hospede_id INT UNSIGNED NOT NULL,
  quarto_id INT UNSIGNED NOT NULL,
  funcionario_id INT UNSIGNED NULL,
  data_checkin DATE NOT NULL,
  data_checkout DATE NOT NULL,
  numero_hospedes SMALLINT UNSIGNED NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendente',
  observacoes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reservas_hospede (hospede_id),
  KEY idx_reservas_quarto_periodo (quarto_id, estado, data_checkin, data_checkout),
  KEY idx_reservas_funcionario (funcionario_id),
  KEY idx_reservas_checkin (data_checkin),
  CONSTRAINT fk_reservas_hospede
    FOREIGN KEY (hospede_id) REFERENCES hospedes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_quarto
    FOREIGN KEY (quarto_id) REFERENCES quartos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_funcionario
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pagamentos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reserva_id INT UNSIGNED NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  metodo VARCHAR(30) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Pago',
  referencia VARCHAR(150) NULL,
  data_pagamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pagamentos_reserva_estado (reserva_id, estado),
  KEY idx_pagamentos_data_estado (data_pagamento, estado),
  CONSTRAINT fk_pagamentos_reserva
    FOREIGN KEY (reserva_id) REFERENCES reservas (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
