import prisma from "../database.js";
import { unlink } from "node:fs/promises";

function validarDadosComprador(corpo) {
    if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
        return { erro: "Informe os dados do comprador." };
    }

    const idCliente = Number(corpo.id_cliente);
    if (!["string", "number"].includes(typeof corpo.id_cliente) ||
        !/^\d+$/.test(String(corpo.id_cliente)) || !Number.isInteger(idCliente) ||
        idCliente < 1 || idCliente > 4_294_967_295) {
        return { erro: "Selecione um cliente válido." };
    }

    if (!["a_vista", "prazo"].includes(corpo.forma_pagamento)) {
        return { erro: "Informe a forma de pagamento: a_vista ou prazo." };
    }

    const dados = { id_cliente: idCliente, forma_pagamento: corpo.forma_pagamento };
    const limitesDecimais = {
        renda_mensal: 9_999_999_999_999.99,
        faixa_valor_min: 99_999_999.99,
        faixa_valor_max: 99_999_999.99,
        area_minima_desejada: 9_999_999.99
    };

    for (const [campo, limite] of Object.entries(limitesDecimais)) {
        const recebido = corpo[campo];
        const valor = typeof recebido === "string" ? recebido.trim() : recebido;
        if (valor === undefined || valor === null || valor === "") {
            if (campo === "renda_mensal") {
                return { erro: "Informe a renda mensal." };
            }
            dados[campo] = null;
            continue;
        }

        if (!["string", "number"].includes(typeof valor) ||
            !/^\d+(\.\d{1,2})?$/.test(String(valor)) ||
            Number(valor) <= 0 || Number(valor) > limite) {
            return { erro: `O campo ${campo} deve ser maior que zero, até ${limite}, com até duas casas decimais.` };
        }
        dados[campo] = String(valor);
    }

    if (dados.faixa_valor_min !== null && dados.faixa_valor_max !== null &&
        Number(dados.faixa_valor_min) > Number(dados.faixa_valor_max)) {
        return { erro: "O valor mínimo não pode ser maior que o valor máximo." };
    }

    const limitesTexto = {
        profissao: 50,
        tipo_imovel_desejado: 50,
        descricao_desejada: 255,
        localizacao_desejada: 100
    };
    for (const [campo, limite] of Object.entries(limitesTexto)) {
        const valor = corpo[campo];
        if (valor !== undefined && valor !== null &&
            (typeof valor !== "string" || valor.trim().length > limite)) {
            return { erro: `O campo ${campo} deve ter até ${limite} caracteres.` };
        }
        dados[campo] = valor?.trim() || null;
    }

    dados.prazo_compra = null;
    const prazo = corpo.prazo_compra;
    if (prazo !== undefined && prazo !== null && prazo !== "") {
        if (typeof prazo !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(prazo) || prazo.slice(0, 4) < "1000") {
            return { erro: "Informe o prazo de compra no formato AAAA-MM-DD." };
        }

        const data = new Date(`${prazo}T00:00:00.000Z`);
        if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== prazo) {
            return { erro: "Informe uma data válida para o prazo de compra." };
        }

        const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
        if (prazo < hoje) {
            return { erro: "O prazo de compra não pode ser uma data passada." };
        }
        dados.prazo_compra = data;
    }

    return { dados };
}

async function removerComprovanteRenda(arquivo) {
    if (!arquivo?.path) {
        return;
    }
    try {
        await unlink(arquivo.path);
    } catch (erro) {
        if (erro.code !== "ENOENT") {
            console.error("Erro ao remover comprovante de renda:", erro);
        }
    }
}

async function cadastrarComprador(req, res) {
    let cadastrado = false;
    try {
        if (!req.file || req.file.size === 0) {
            return res.status(400).json({ erro: "Anexe o comprovante de renda." });
        }

        const { dados, erro } = validarDadosComprador(req.body);
        if (erro) {
            return res.status(400).json({ erro });
        }

        const comprador = await prisma.comprador.create({
            data: {
                ...dados,
                url_comprovante_renda: `http://localhost:3000/uploads/comprovantes-renda/${req.file.filename}`
            }
        });
        cadastrado = true;
        return res.status(201).json({ comprador });
    } catch (erro) {
        if (erro.code === "P2002") {
            return res.status(409).json({ erro: "Este cliente já está cadastrado como comprador." });
        }
        if (erro.code === "P2003") {
            return res.status(404).json({ erro: "Cliente não encontrado." });
        }

        console.error("Erro ao cadastrar comprador:", erro);
        return res.status(500).json({ erro: "Não foi possível cadastrar o comprador." });
    } finally {
        if (!cadastrado) {
            await removerComprovanteRenda(req.file);
        }
    }
}

/**
 * @author Davi Oliveira Ferreira Santos
 *
 * Exclui um comprador do banco de dados pelo seu ID.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_comprador` ou `req.params.id`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna mensagem de sucesso ou mensagem de erro.
 */
async function excluirComprador(req, res) {
    const id = Number(req.params.id_comprador || req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
    }

    try {
        const comprador = await prisma.comprador.findUnique({
            where: {
                id_comprador: id
            }
        });

        if (!comprador) {
            return res.status(404).json({ erro: "Comprador não encontrado!" });
        }

        await prisma.comprador.delete({
            where: {
                id_comprador: id
            }
        });

        return res.status(200).json({ mensagem: 'Comprador excluído com sucesso!' });

    } catch (error) {
        console.error("Erro ao excluir comprador:", error);

        return res.status(500).json({
            erro: "Erro ao excluir o comprador!",
            detalhes: error.message
        });
    }
}

export { 
    cadastrarComprador,
    //editarComprador,
    excluirComprador,
    //pesquisarComprador,
    //buscarCompradorPorID 
  };
