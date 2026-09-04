USE scaci;
-- ====================================================================
-- 1. POVOAMENTO DA TABELA: Funcionario (2 Assistentes)
-- ====================================================================
INSERT INTO Funcionario (id_funcionario, nome, cpf, salario, funcao, email, telefone) VALUES
(1, 'Carlos Souza', '11122233344', 2500.00, 'Assistente', 'carlos.souza@imobiliaria.com', '11911112222'),
(2, 'Ana Costa', '22233344455', 2500.00, 'Assistente', 'ana.costa@imobiliaria.com', '11922223333');

-- ====================================================================
-- 2. POVOAMENTO DA TABELA: Corretor (3 corretores, 1 interno chamado Kleber)
-- ====================================================================
INSERT INTO Corretor (id_corretor, tipo, creci_corretor, nome, cpf_cnpj, data_nascimento, telefone, email, logradouro, numero, bairro, complemento, cidade, uf, cep) VALUES
(1, 'interno', 'CRECI12345', 'Kleber Vieira Lima', '33344455566', '1985-05-20', '11933334444', 'kleber.lima@imobiliaria.com', 'Av. Paulista', '1000', 'Bela Vista', 'Apto 42', 'São Paulo', 'SP', '01310100'),
(2, 'externo', 'CRECI54321', 'Marcos Rocha', '44455566677', '1990-11-12', '11944445555', 'marcos.rocha@gmail.com', 'Rua Augusta', '500', 'Consolação', NULL, 'São Paulo', 'SP', '01305000'),
(3, 'externo', 'CRECI98765', 'Patricia Silva', '55566677788', '1988-03-15', '11955556666', 'patricia.silva@gmail.com', 'Alameda Lorena', '1200', 'Jardins', 'Bloco B', 'São Paulo', 'SP', '01424001');

-- ====================================================================
-- 3. POVOAMENTO DA TABELA: Cliente (21 Clientes no total - Com 2 Neutros)
-- ====================================================================
INSERT INTO Cliente (id_cliente, nome, cpf_cnpj, data_nascimento, telefone, email, url_comprovante_residencia, logradouro, numero, bairro, complemento, cidade, uf, cep, estado_civil, tipo_cliente) VALUES
-- Compradores (9)
(1, 'Alice Silva', '12345678901', '1995-01-10', '11977770001', 'alice@email.com', 'http://doc/res1.pdf', 'Rua A', '1', 'Centro', NULL, 'São Paulo', 'SP', '01000000', 'casado', 'comprador'),
(2, 'Bruno Santos', '23456789012', '1992-02-15', '11977770002', 'bruno@email.com', 'http://doc/res2.pdf', 'Rua B', '2', 'Centro', NULL, 'São Paulo', 'SP', '01000000', 'casado', 'comprador'),
(3, 'Carla Diaz', '34567890123', '1989-03-20', '11977770003', 'carla@email.com', 'http://doc/res3.pdf', 'Rua C', '3', 'Jardins', NULL, 'São Paulo', 'SP', '01400000', 'solteiro', 'comprador'),
(4, 'Diego Souza', '45678901234', '1994-04-25', '11977770004', 'diego@email.com', 'http://doc/res4.pdf', 'Rua D', '4', 'Jardins', NULL, 'São Paulo', 'SP', '01400000', 'solteiro', 'comprador'),
(5, 'Eduarda Lima', '56789012345', '1991-05-30', '11977770005', 'eduarda@email.com', 'http://doc/res5.pdf', 'Rua E', '5', 'Lapa', NULL, 'São Paulo', 'SP', '05000000', 'divorciado', 'comprador'),
(6, 'Fábio Melo', '67890123456', '1987-06-05', '11977770006', 'fabio@email.com', 'http://doc/res6.pdf', 'Rua F', '6', 'Lapa', NULL, 'São Paulo', 'SP', '05000000', 'viuvo', 'comprador'),
(7, 'Gabriel Cruz', '78901234567', '1996-07-10', '11977770007', 'gabriel@email.com', 'http://doc/res7.pdf', 'Rua G', '7', 'Moema', NULL, 'São Paulo', 'SP', '04500000', 'solteiro', 'comprador'),
(8, 'Amanda Rodrigues', '89012345678', '1993-08-15', '11977770008', 'amanda@email.com', 'http://doc/res8.pdf', 'Rua H', '8', 'Moema', NULL, 'São Paulo', 'SP', '04500000', 'solteiro', 'comprador'),
(9, 'Igor Gomes', '90123456789', '1990-09-20', '11977770009', 'igor@email.com', 'http://doc/res9.pdf', 'Rua I', '9', 'Pinheiros', NULL, 'São Paulo', 'SP', '05400000', 'solteiro', 'comprador'),
-- Proprietários (10)
(10, 'João Pereira', '01234567890', '1975-10-25', '11988880010', 'joao@email.com', 'http://doc/res10.pdf', 'Av X', '10', 'Pinheiros', NULL, 'São Paulo', 'SP', '05400000', 'casado', 'proprietario'),
(11, 'Kátia Oliveira', '12345678902', '1980-11-30', '11988880011', 'katia@email.com', 'http://doc/res11.pdf', 'Av Y', '11', 'Butantã', NULL, 'São Paulo', 'SP', '05500000', 'casado', 'proprietario'),
(12, 'Lucas Martins', '23456789013', '1983-12-05', '11988880012', 'lucas@email.com', 'http://doc/res12.pdf', 'Av Z', '12', 'Butantã', NULL, 'São Paulo', 'SP', '05500000', 'solteiro', 'proprietario'),
(13, 'Maria Fernanda', '34567890124', '1978-01-15', '11988880013', 'maria@email.com', 'http://doc/res13.pdf', 'Av W', '13', 'Santana', NULL, 'São Paulo', 'SP', '02000000', 'solteiro', 'proprietario'),
(14, 'Nilson Reis', '45678901235', '1969-02-20', '11988880014', 'nilson@email.com', 'http://doc/res14.pdf', 'Av V', '14', 'Santana', NULL, 'São Paulo', 'SP', '02000000', 'divorciado', 'proprietario'),
(15, 'Olívia Palmo', '56789012346', '1986-03-25', '11988880015', 'olivia@email.com', 'http://doc/res15.pdf', 'Av U', '15', 'Itaim', NULL, 'São Paulo', 'SP', '04500000', 'solteiro', 'proprietario'),
(16, 'Pedro Alvares', '67890123457', '1972-04-30', '11988880016', 'pedro@email.com', 'http://doc/res16.pdf', 'Av T', '16', 'Itaim', NULL, 'São Paulo', 'SP', '04500000', 'viuvo', 'proprietario'),
(17, 'Regina Duarte', '78901234568', '1965-05-05', '11988880017', 'regina@email.com', 'http://doc/res17.pdf', 'Av S', '17', 'Tatuapé', NULL, 'São Paulo', 'SP', '03300000', 'solteiro', 'proprietario'),
(18, 'Sérgio Malandro', '89012345679', '1982-06-10', '11988880018', 'sergio@email.com', 'http://doc/res18.pdf', 'Av R', '18', 'Tatuapé', NULL, 'São Paulo', 'SP', '03300000', 'solteiro', 'proprietario'),
(19, 'Tânia Mara', '90123456780', '1987-07-15', '11988880019', 'tania@email.com', 'http://doc/res19.pdf', 'Av Q', '19', 'Mooca', NULL, 'São Paulo', 'SP', '03100000', 'solteiro', 'proprietario');



-- ====================================================================
-- 4. POVOAMENTO DA TABELA: Comprador (9 compradores)
-- ====================================================================
INSERT INTO Comprador (id_cliente, renda_mensal, profissao, forma_pagamento, tipo_imovel_desejado, faixa_valor_min, faixa_valor_max, prazo_compra, descricao_desejada, area_minima_desejada, localizacao_desejada, url_comprovante_renda) VALUES
(1, 15000.00, 'Engenheiro', 'a_vista', 'casa_ape', 500000.00, 800000.00, '2026-12-31', 'Apartamento de 3 quartos', 90.00, 'Centro', 'http://doc/r
enda1.pdf'),
(2, 12000.00, 'Advogado', 'prazo', 'casa_ape', 400000.00, 600000.00, '2026-10-31', 'Apartamento com varanda', 70.00, 'Centro', 'http://doc/renda2.pdf'),
(3, 8000.00, 'Analista', 'prazo', 'casa_ape', 300000.00, 450000.00, '2027-01-01', 'Próximo ao metrô', 50.00, 'Jardins', 'http://doc/renda3.pdf'),
(4, 25000.00, 'Médico', 'a_vista', 'terreno', 1000000.00, 2000000.00, '2026-08-30', 'Terreno em condomínio', 500.00, 'Jardins', 'http://doc/renda4.pdf'),
(5, 9500.00, 'Gerente', 'prazo', 'casa_ape', 350000.00, 500000.00, '2026-11-15', 'Com vaga de garagem', 65.00, 'Lapa', 'http://doc/renda5.pdf'),
(6, 11000.00, 'Professor', 'prazo', 'casa_ape', 400000.00, 550000.00, '2026-12-01', '2 dormitórios', 60.00, 'Lapa', 'http://doc/renda6.pdf'),
(7, 18000.00, 'Arquiteto', 'a_vista', 'casa_ape', 700000.00, 1100000.00, '2026-09-01', 'Cobertura', 120.00, 'Moema', 'http://doc/renda7.pdf'),
(8, 7000.00, 'Designer', 'prazo', 'casa_ape', 250000.00, 380000.00, '2027-03-01', 'Studio', 35.00, 'Moema', 'http://doc/renda8.pdf'),
(9, 14000.00, 'Empresário', 'a_vista', 'terreno', 600000.00, 900000.00, '2026-07-15', 'Terreno comercial', 250.00, 'Pinheiros', 'http://doc/renda9.pdf');

-- ====================================================================
-- 5. POVOAMENTO DA TABELA: Proprietario (10 proprietários)
-- ====================================================================
INSERT INTO Proprietario (id_cliente, prazo_venda, observacao) VALUES
(10, '2026-12-31', 'Preferencia por venda rápida'),
(11, '2027-06-30', 'Imóvel herdado'),
(12, '2026-09-15', 'Não aceita permuta'),
(13, '2026-10-01', 'Valor negociável'),
(14, '2026-11-20', 'Documentação em ordem'),
(15, '2027-02-28', 'Desocupado'),
(16, '2026-08-01', 'Aceita financiamento'),
(17, '2026-12-01', 'Mobiliado'),
(18, '2026-10-10', 'Precisa de reforma'),
(19, '2027-01-15', 'Único dono');

-- ====================================================================
-- 6. POVOAMENTO DA TABELA: Conjuge (4 cônjuges)
-- ====================================================================
INSERT INTO Conjuge (cpf, nome, regime_bens, data_nascimento, url_comprovante_uniao, id_cliente) VALUES
('99988877711', 'Marcos Silva', 'Comunhão Parcial', '1993-05-12', 'http://doc/uniao1.pdf', 1),
('99988877722', 'Fernanda Santos', 'Comunhão Universal', '1994-07-22', 'http://doc/uniao2.pdf', 2),
('99988877733', 'Maria Pereira', 'Comunhão Parcial', '1977-02-14', 'http://doc/uniao3.pdf', 10),
('99988877744', 'Ricardo Oliveira', 'Separação Total', '1979-11-05', 'http://doc/uniao4.pdf', 11);

-- ====================================================================
-- 7. POVOAMENTO DA TABELA: Imovel (12 Imóveis no total)
-- ====================================================================
INSERT INTO Imovel (id_imovel, matricula_imovel, situacao_legal, url_comprovante_posse, url_certidao_matricula, data_disponibilidade, valor_venda, valor_minimo_venda, observacao, area_total, descricao_imovel, cotacao_imovel, inscricao_iptu, logradouro, numero, bairro, complemento, cidade, uf, cep, tipo_imovel, id_proprietario) VALUES
(1, 'MAT101', 'Regular', 'http://doc/posse1.pdf', 'http://doc/mat1.pdf', '2024-01-01', 650000.00, 600000.00, 'Chaves na imobiliária', 120.00, 'Apartamento amplo', 630000.00, 'IPTU001', 'Rua das Flores', '10', 'Centro', 'Apto 11', 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 10),
(2, 'MAT102', 'Irregular', 'http://doc/posse2.pdf', 'http://doc/mat2.pdf', '2024-02-01', 300000.00, 280000.00, 'Inventário pendente', 250.00, 'Lote residencial', 290000.00, 'IPTU002', 'Av Principal', 'S/N', 'Industrial', NULL, 'Vitória da Conquista', 'BA', '45000000', 'terreno', 10),
(3, 'MAT103', 'Regular', 'http://doc/posse3.pdf', 'http://doc/mat3.pdf', '2025-01-15', 550000.00, 520000.00, 'Reformado', 85.00, 'Apartamento aconchegante', 540000.00, 'IPTU003', 'Alameda Santos', '50', 'Jardins', 'Apto 52', 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 11),
(4, 'MAT104', 'Regular', 'http://doc/posse4.pdf', 'http://doc/mat4.pdf', '2024-03-01', 400000.00, 380000.00, 'Terreno murado', 300.00, 'Terreno bem localizado', 390000.00, 'IPTU004', 'Rua dos Pinheiros', '500', 'Pinheiros', NULL, 'Vitória da Conquista', 'BA', '45000000', 'terreno', 11),
(5, 'MAT105', 'Em inventário', 'http://doc/posse5.pdf', 'http://doc/mat5.pdf', '2025-01-10', 450000.00, 420000.00, 'Documentação em andamento', 90.00, 'Casa de condomínio', 440000.00, 'IPTU005', 'Rua da Lapa', '12', 'Lapa', NULL, 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 12),
(6, 'MAT106', 'Regular', 'http://doc/posse6.pdf', 'http://doc/mat6.pdf', '2025-02-10', 700000.00, 670000.00, 'Próximo ao parque', 110.00, 'Apartamento Duplex', 690000.00, 'IPTU006', 'Av Moema', '750', 'Moema', 'Coletiva', 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 13),
(7, 'MAT107', 'Regular', 'http://doc/posse7.pdf', 'http://doc/mat7.pdf', '2025-01-20', 350000.00, 330000.00, 'Zona comercial', 200.00, 'Terreno Comercial', 340000.00, 'IPTU007', 'Rua Augusta', '900', 'Consolação', NULL, 'Vitória da Conquista', 'BA', '45000000', 'terreno', 14),
(8, 'MAT108', 'Regular', 'http://doc/posse8.pdf', 'http://doc/mat8.pdf', '2026-03-15', 500000.00, 480000.00, 'Vista livre', 75.00, 'Apartamento padrão', 490000.00, 'IPTU008', 'Rua Butantã', '32', 'Butantã', 'Bloco A', 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 15),
(9, 'MAT109', 'Regular', 'http://doc/posse9.pdf', 'http://doc/mat9.pdf', '2026-02-25', 900000.00, 850000.00, 'Alto padrão', 150.00, 'Casa de Vila', 880000.00, 'IPTU009', 'Rua Pamplona', '1500', 'Jardins', NULL, 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 16),
(10, 'MAT110', 'Regular', 'http://doc/posse10.pdf', 'http://doc/mat10.pdf', '2026-04-01', 280000.00, 260000.00, 'Excelente topografia', 260.00, 'Lote plano', 270000.00, 'IPTU010', 'Av Santana', '2000', 'Santana', NULL, 'Vitória da Conquista', 'BA', '45000000', 'terreno', 17),
(11, 'MAT111', 'Regular', 'http://doc/posse11.pdf', 'http://doc/mat11.pdf', '2026-01-05', 620000.00, 590000.00, 'Perto de escolas', 105.00, 'Apartamento Familiar', 610000.00, 'IPTU011', 'Rua Itaim', '14', 'Itaim', 'Apto 101', 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 18),
(12, 'MAT112', 'Regular', 'http://doc/posse12.pdf', 'http://doc/mat12.pdf', '2026-02-18', 480000.00, 450000.00, 'Vaga coberta', 80.00, 'Apartamento Novo', 470000.00, 'IPTU012', 'Rua Tatuapé', '88', 'Tatuapé', 'Apto 33', 'Vitória da Conquista', 'BA', '45000000', 'casa_ape', 19);

-- ====================================================================
-- 8. POVOAMENTO DA TABELA: Terreno
-- ====================================================================
INSERT INTO Terreno (zona, tipo_terreno, id_imovel) VALUES
('urbana', 'loteamento', 2),
('urbana', 'loteamento', 4),
('urbana', 'rural', 7),
('urbana', 'loteamento', 10);

-- ====================================================================
-- 9. POVOAMENTO DA TABELA: Casa_Ape
-- ====================================================================
INSERT INTO Casa_Ape (valor_iptu_anual, data_ultimo_iptu, valor_condominio, id_imovel) VALUES
(1200.00, '2026-02-10', 450.00, 1),
(1100.00, '2026-02-10', 400.00, 3),
(1500.00, '2026-03-01', 0.00, 5),
(1800.00, '2026-01-15', 650.00, 6),
(1000.00, '2026-02-15', 380.00, 8),
(2500.00, '2026-01-20', 0.00, 9),
(1400.00, '2026-02-28', 500.00, 11),
(1150.00, '2026-03-05', 420.00, 12);

-- ====================================================================
-- 10. POVOAMENTO DA TABELA: Agenda_Visita (5 visitas)
-- ====================================================================
INSERT INTO Agenda_Visita (id_visita, data_visita, horario_visita, status_visita, id_comprador, id_imovel, id_funcionario) VALUES
(1, '2026-06-10', '14:00:00', 'agendada', 1, 1, 1),
(2, '2026-06-11', '10:30:00', 'agendada', 2, 3, 1),
(3, '2026-06-12', '16:00:00', 'agendada', 3, 5, 2),
(4, '2026-06-13', '09:00:00', 'agendada', 4, 2, 2),
(5, '2026-06-14', '15:30:00', 'agendada', 5, 6, 1);

-- ====================================================================
-- 11. POVOAMENTO DA TABELA: Venda (12 Vendas no total)
-- ====================================================================
INSERT INTO Venda (id_venda, comissao_venda, data_proposta, valor_final, forma_pagamento, url_contrato, data_escritura, data_entrega_chave, livro_folha_cartorio, status_venda, valor_entrada, saldo_devedor, observacoes, data_assinatura_contrato, id_comprador, id_proprietario, id_imovel, id_funcionario) VALUES
(1, 39000.00, '2024-05-01', 650000.00, 'a_vista', 'http://doc/venda1.pdf', '2024-05-20', '2024-05-25', 'Livro 45, Fl 12', 'concluida', 650000.00, 0.00, 'Vendido rapidamente', '2024-05-10', 1, 10, 1, 1),
(2, 18000.00, '2024-08-10', 300000.00, 'prazo', 'http://doc/venda2.pdf', '2024-09-01', '2024-09-05', 'Livro 45, Fl 15', 'concluida', 100000.00, 200000.00, 'Financiamento Caixa', '2024-08-20', 2, 10, 2, 2),
(3, 33000.00, '2025-05-02', 550000.00, 'a_vista', 'http://doc/venda3.pdf', '2025-05-22', '2025-05-22', 'Livro 46, Fl 01', 'concluida', 550000.00, 0.00, 'Sem pendências', '2025-05-12', 3, 11, 3, 1),
(4, 24000.00, '2025-05-15', 400000.00, 'a_vista', 'http://doc/venda4.pdf', '2025-05-30', '2025-06-02', 'Livro 46, Fl 05', 'concluida', 400000.00, 0.00, 'Mês de Maio bombando', '2025-05-20', 4, 11, 4, 2),
(5, 27000.00, '2025-05-18', 450000.00, 'prazo', 'http://doc/venda5.pdf', '2025-06-10', '2025-06-15', 'Livro 46, Fl 10', 'concluida', 150000.00, 300000.00, 'Outra em Maio', '2025-05-25', 5, 12, 5, 1),
(6, 42000.00, '2025-09-05', 700000.00, 'a_vista', 'http://doc/venda6.pdf', '2025-09-25', '2025-09-30', 'Livro 46, Fl 20', 'concluida', 700000.00, 0.00, 'Duplex alto m²', '2025-09-15', 6, 13, 6, 2),
(7, 21000.00, '2025-11-12', 350000.00, 'prazo', 'http://doc/venda7.pdf', '2025-12-01', '2025-12-05', 'Livro 47, Fl 02', 'concluida', 200000.00, 150000.00, 'Direto com proprietário', '2025-11-20', 7, 14, 7, 1),
(8, 30000.00, '2026-01-10', 500000.00, 'a_vista', 'http://doc/venda8.pdf', '2026-01-25', '2026-01-30', 'Livro 48, Fl 01', 'concluida', 500000.00, 0.00, 'Iniciando o ano', '2026-01-15', 8, 15, 8, 2),
(9, 54000.00, '2026-03-01', 900000.00, 'a_vista', 'http://doc/venda9.pdf', '2026-03-15', '2026-03-20', 'Livro 48, Fl 15', 'concluida', 900000.00, 0.00, 'Casa luxo Jardins', '2026-03-05', 9, 16, 9, 1),
(10, 16800.00, '2026-04-10', 280000.00, 'prazo', 'http://doc/venda10.pdf', NULL, NULL, NULL, 'andamento', 50000.00, 230000.00, 'Aguardando banco', '2026-04-15', 1, 17, 10, 2),
(11, 37200.00, '2026-05-02', 620000.00, 'a_vista', 'http://doc/venda11.pdf', '2026-05-20', '2026-05-22', 'Livro 49, Fl 02', 'concluida', 620000.00, 0.00, 'Perto de Escolas', '2026-05-10', 2, 18, 11, 1),
(12, 28800.00, '2026-05-15', 480000.00, 'a_vista', 'http://doc/venda12.pdf', '2026-06-01', '2026-06-05', 'Livro 49, Fl 10', 'concluida', 480000.00, 0.00, 'Apartamento Novo', '2026-05-20', 3, 19, 12, 2);

-- ====================================================================
-- 12. POVOAMENTO DA TABELA: Corretor_Venda (Associações de comissões)
-- ====================================================================
INSERT INTO Corretor_Venda (id_corretor, id_venda, comissao_corretor) VALUES
(1, 1, 19500.00), (2, 1, 19500.00),
(2, 2, 18000.00),
(3, 3, 33000.00),
(1, 4, 24000.00),
(2, 5, 27000.00),
(3, 6, 42000.00),
(1, 7, 21000.00),
(1, 8, 30000.00),
(2, 9, 54000.00),
(3, 11, 37200.00),
(1, 12, 14400.00), (2, 12, 14400.00);