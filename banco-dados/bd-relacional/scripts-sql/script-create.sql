CREATE DATABASE scaci;
USE scaci;

CREATE TABLE Cliente (
    id_cliente INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(14) NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    url_comprovante_residencia VARCHAR(255) NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    complemento VARCHAR(50),
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo') NOT NULL,
    tipo_cliente ENUM('comprador', 'proprietario') NOT NULL,
    UNIQUE (cpf_cnpj, email)
);

CREATE TABLE Funcionario (
    id_funcionario INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    salario DECIMAL(7,2) UNSIGNED NOT NULL,
    funcao VARCHAR(50),
    email VARCHAR(200) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    UNIQUE (cpf, email)
);

CREATE TABLE Imovel (
    id_imovel INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    matricula_imovel VARCHAR(30) NOT NULL UNIQUE,
    situacao_legal VARCHAR(50) NOT NULL,
    url_comprovante_posse VARCHAR(255) NOT NULL,
    url_certidao_matricula VARCHAR(255) NOT NULL,
    data_disponibilidade DATE,
    valor_venda DECIMAL(10,2) UNSIGNED NOT NULL,
    valor_minimo_venda DECIMAL(10,2) UNSIGNED,
    observacao VARCHAR(255),
    area_total DECIMAL(9,2) UNSIGNED,
    descricao_imovel VARCHAR(255),
    cotacao_imovel DECIMAL(10,2) UNSIGNED,
    inscricao_iptu VARCHAR(20) NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    complemento VARCHAR(50),
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    tipo_imovel ENUM('terreno', 'casa_ape') NOT NULL,
    id_proprietario INTEGER UNSIGNED
);

CREATE TABLE Venda (
    id_venda INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comissao_venda DECIMAL(8,2) UNSIGNED ,
    data_proposta DATE,
    valor_final DECIMAL(10,2) UNSIGNED,
    forma_pagamento ENUM('prazo', 'a_vista'),
    url_contrato VARCHAR(255) ,
    data_escritura DATE ,
    data_entrega_chave DATE ,
    livro_folha_cartorio VARCHAR(20) ,
    status_venda ENUM('andamento', 'concluida', 'cancelada'),
    valor_entrada DECIMAL(8,2) UNSIGNED,
    saldo_devedor DECIMAL(10,2) UNSIGNED,
    observacoes VARCHAR(255),
    data_assinatura_contrato DATE,
    id_comprador INTEGER UNSIGNED,
    id_proprietario INTEGER UNSIGNED,
    id_imovel INTEGER UNSIGNED,
    id_funcionario INTEGER UNSIGNED
);

CREATE TABLE Corretor (
    id_corretor INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('interno', 'externo') NOT NULL,
    creci_corretor VARCHAR(15) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(14) NOT NULL,
    data_nascimento DATE,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(200) NOT NULL,
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    complemento VARCHAR(50),
    cidade VARCHAR(100),
    uf CHAR(2),
    cep CHAR(8),
    UNIQUE (cpf_cnpj, creci_corretor, email)
);

CREATE TABLE Comprador (
    renda_mensal DECIMAL(15,2) NOT NULL,
    profissao VARCHAR(50),
    forma_pagamento ENUM('prazo', 'a_vista') NOT NULL,
    tipo_imovel_desejado VARCHAR(50),
    faixa_valor_min DECIMAL(10,2) UNSIGNED,
    faixa_valor_max DECIMAL(10,2) UNSIGNED,
    prazo_compra DATE,
    descricao_desejada VARCHAR(255),
    area_minima_desejada DECIMAL(9,2) UNSIGNED,
    localizacao_desejada VARCHAR(100),
    url_comprovante_renda VARCHAR(255) NOT NULL,
    id_cliente INTEGER UNSIGNED PRIMARY KEY
);

CREATE TABLE Proprietario (
    prazo_venda DATE,
    observacao VARCHAR(255),
    id_cliente INTEGER UNSIGNED PRIMARY KEY
);

CREATE TABLE Agenda_Visita (
    id_visita INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    data_visita DATE NOT NULL,
    horario_visita TIME NOT NULL,
    status_visita ENUM('agendada', 'realizada', 'cancelada', 'reagendada') NOT NULL,
    id_comprador INTEGER UNSIGNED,
    id_imovel INTEGER UNSIGNED,
    id_funcionario INTEGER UNSIGNED
);

CREATE TABLE Conjuge (
    cpf VARCHAR(11),
    nome VARCHAR(100) NOT NULL,
    regime_bens VARCHAR(50) NOT NULL,
    data_nascimento DATE,
    url_comprovante_uniao VARCHAR(255) NOT NULL,
    id_cliente INTEGER UNSIGNED,
    PRIMARY KEY (id_cliente, cpf)
);

CREATE TABLE Casa_Ape (
    valor_iptu_anual DECIMAL(6,2) UNSIGNED NOT NULL,
    data_ultimo_iptu DATE NOT NULL,
    valor_condominio DECIMAL(6,2) UNSIGNED,
    id_imovel INTEGER UNSIGNED PRIMARY KEY
);

CREATE TABLE Terreno (
    zona ENUM('rural', 'urbana') NOT NULL,
    tipo_terreno ENUM('rural', 'loteamento') NOT NULL,
    id_imovel INTEGER UNSIGNED PRIMARY KEY
);

CREATE TABLE Corretor_Venda (
    id_corretor INTEGER UNSIGNED,
    id_venda INTEGER UNSIGNED,
    comissao_corretor DECIMAL(8,2) UNSIGNED NOT NULL,
    PRIMARY KEY (id_corretor, id_venda)
);
 
ALTER TABLE Imovel ADD CONSTRAINT FK_Imovel_2
    FOREIGN KEY (id_proprietario)
    REFERENCES Proprietario (id_cliente);
 
ALTER TABLE Venda ADD CONSTRAINT FK_Venda_2
    FOREIGN KEY (id_comprador)
    REFERENCES Comprador (id_cliente);
 
ALTER TABLE Venda ADD CONSTRAINT FK_Venda_3
    FOREIGN KEY (id_proprietario)
    REFERENCES Proprietario (id_cliente);
 
ALTER TABLE Venda ADD CONSTRAINT FK_Venda_4
    FOREIGN KEY (id_imovel)
    REFERENCES Imovel (id_imovel);
 
ALTER TABLE Venda ADD CONSTRAINT FK_Venda_5
    FOREIGN KEY (id_funcionario)
    REFERENCES Funcionario (id_funcionario);
 
ALTER TABLE Comprador ADD CONSTRAINT FK_Comprador_2
    FOREIGN KEY (id_cliente)
    REFERENCES Cliente (id_cliente);
 
ALTER TABLE Proprietario ADD CONSTRAINT FK_Proprietario_2
    FOREIGN KEY (id_cliente)
    REFERENCES Cliente (id_cliente);
 
ALTER TABLE Agenda_Visita ADD CONSTRAINT FK_Agenda_Visita_2
    FOREIGN KEY (id_imovel)
    REFERENCES Imovel (id_imovel);
 
ALTER TABLE Agenda_Visita ADD CONSTRAINT FK_Agenda_Visita_3
    FOREIGN KEY (id_comprador)
    REFERENCES Comprador (id_cliente);
 
ALTER TABLE Agenda_Visita ADD CONSTRAINT FK_Agenda_Visita_4
    FOREIGN KEY (id_funcionario)
    REFERENCES Funcionario (id_funcionario);
 
ALTER TABLE Conjuge ADD CONSTRAINT FK_Conjuge_1
    FOREIGN KEY (id_cliente)
    REFERENCES Cliente (id_cliente);
 
ALTER TABLE Casa_Ape ADD CONSTRAINT FK_Casa_Ape_2
    FOREIGN KEY (id_imovel)
    REFERENCES Imovel (id_imovel)
    ON DELETE CASCADE;
 
ALTER TABLE Terreno ADD CONSTRAINT FK_Terreno_2
    FOREIGN KEY (id_imovel)
    REFERENCES Imovel (id_imovel)
    ON DELETE CASCADE;
 
ALTER TABLE Corretor_Venda ADD CONSTRAINT FK_Corretor_Venda_2
    FOREIGN KEY (id_corretor)
    REFERENCES Corretor (id_corretor);
 
ALTER TABLE Corretor_Venda ADD CONSTRAINT FK_Corretor_Venda_3
    FOREIGN KEY (id_venda)
    REFERENCES Venda (id_venda);