-- Consulta 1
SELECT MONTH(data_assinatura_contrato) Mês
FROM venda
WHERE status_venda = 'concluida' AND 
	YEAR(data_assinatura_contrato) = 2025 
GROUP BY MONTH(data_assinatura_contrato)
HAVING COUNT(*) >= ALL (
	SELECT COUNT(*)
    FROM Venda
    WHERE status_venda = 'concluida' AND 
		YEAR(data_assinatura_contrato) = 2025 
	GROUP BY MONTH(data_assinatura_contrato)
);

-- Consulta 2
SELECT C.nome 'Nome Corretor', COUNT(B.id_venda) 'Total de Vendas', SUM(A.comissao_corretor) 'Total de Comissão'
FROM Corretor_Venda A
JOIN Venda B ON A.id_venda = B.id_venda
JOIN corretor C ON A.id_corretor = C.id_corretor
WHERE YEAR(B.data_assinatura_contrato) = 2025 AND
	B.status_venda = 'concluida'
GROUP BY A.id_corretor, c.nome;

-- Consulta 3
SELECT B.bairro 'Bairros com mais vendas', COUNT(A.id_venda) 'Total de Vendas'
FROM Venda A
JOIN Imovel B ON A.id_imovel = B.id_imovel
WHERE (A.status_venda = 'concluida') AND 
	(YEAR(A.data_assinatura_contrato) BETWEEN 2024 AND 2026)
GROUP BY B.bairro
ORDER BY COUNT(*) DESC LIMIT 5;

-- Consulta 4
SELECT B.id_imovel 'ID imóvel', B.bairro 'Bairro', B.area_total 'Metragem', (A.valor_final/B.area_total) 'Valor m²'
FROM Venda A
JOIN Imovel B ON A.id_imovel = B.id_imovel
WHERE (A.status_venda = 'concluida') AND
	(YEAR(A.data_assinatura_contrato) BETWEEN 2025 AND 2026)
ORDER BY (A.valor_final/B.area_total) DESC;

-- Consulta 5
SELECT A.tipo_imovel 'Tipo de Imóvel Mais Vendido'
FROM Imovel A
JOIN Venda B ON A.id_imovel = B.id_imovel
WHERE (YEAR(B.data_assinatura_contrato) = 2025) AND
	(B.status_venda = 'concluida')
GROUP BY A.tipo_imovel
HAVING COUNT(*) >= ALL (
	SELECT COUNT(*)
FROM Imovel C
JOIN Venda D ON C.id_imovel = D.id_imovel
WHERE (YEAR(D.data_assinatura_contrato) = 2025) AND
	(D.status_venda = 'concluida')
GROUP BY C.tipo_imovel
);