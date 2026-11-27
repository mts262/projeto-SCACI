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
 * Lista compradores e pesquisa pelo nome ou CPF/CNPJ do cliente associado.
 * O parâmetro opcional req.query.q contém o texto digitado na tela de pesquisa.
 */
async function pesquisarComprador(req, res) {
    const consulta = req.query.q;
    if (consulta !== undefined && typeof consulta !== "string") {
        return res.status(400).json({ erro: "Informe apenas um texto para a pesquisa." });
    }

    const termo = consulta?.trim();
    const where = {};
    if (termo) {
        const filtros = [{ nome: { contains: termo } }];
        const documento = termo.replace(/\D/g, "");
        if (documento) {
            filtros.push({ cpf_cnpj: { contains: documento } });
        }
        where.cliente = { is: { OR: filtros } };
    }

    try {
        const compradores = await prisma.comprador.findMany({
            where,
            select: {
                id_cliente: true,
                cliente: {
                    select: {
                        nome: true,
                        cpf_cnpj: true,
                        email: true
                    }
                }
            },
            orderBy: { id_cliente: "desc" }
        });

        const resultado = compradores.map(({ id_cliente, cliente }) => ({
            // A tela usa id_comprador nas ações; no banco, a chave é id_cliente.
            id_comprador: id_cliente,
            id_cliente,
            nome: cliente.nome,
            cpf_cnpj: cliente.cpf_cnpj,
            email: cliente.email ?? ""
        }));

        return res.status(200).json(resultado);
    } catch (erro) {
        console.error("Erro ao pesquisar compradores:", erro);
        return res.status(500).json({ erro: "Não foi possível pesquisar os compradores." });
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

/**
 * @author Ian
 *
 * Converte o parâmetro de rota em um ID de comprador válido.
 * No banco, o comprador é identificado pelo id_cliente do cliente associado.
 *
 * @param {string} parametro - Valor recebido em `req.params`.
 * @returns {number|null} O ID numérico ou null se for inválido.
 */
function obterIdComprador(parametro) {
    if (!/^\d+$/.test(String(parametro ?? ""))) {
        return null;
    }
    const id = Number(parametro);
    return id >= 1 && id <= 4_294_967_295 ? id : null;
}

/**
 * @author Ian
 *
 * Converte a URL pública de um comprovante de renda no caminho do arquivo em disco.
 *
 * @param {string} url - URL salva em `url_comprovante_renda`.
 * @returns {string|null} Caminho relativo do arquivo ou null se a URL não for de upload local.
 */
function caminhoComprovantePorUrl(url) {
    const prefixo = "http://localhost:3000/uploads/comprovantes-renda/";
    if (typeof url !== "string" || !url.startsWith(prefixo)) {
        return null;
    }
    const nomeArquivo = url.slice(prefixo.length);
    if (!nomeArquivo || nomeArquivo.includes("/") || nomeArquivo.includes("\\") || nomeArquivo.includes("..")) {
        return null;
    }
    return `uploads/comprovantes-renda/${nomeArquivo}`;
}

/**
 * @author Ian
 *
 * Busca um único comprador pelo seu ID (id_cliente), junto com os dados básicos do cliente.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_comprador` ou `req.params.id`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna os dados do comprador encontrado ou um erro 400/404/500.
 */
async function buscarCompradorPorID(req, res) {
    const id = obterIdComprador(req.params.id_comprador ?? req.params.id);
    if (id === null) {
        return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
    }

    try {
        const comprador = await prisma.comprador.findUnique({
            where: { id_cliente: id },
            include: {
                cliente: {
                    select: {
                        nome: true,
                        cpf_cnpj: true,
                        email: true
                    }
                }
            }
        });

        if (!comprador) {
            return res.status(404).json({ erro: "Comprador não encontrado!" });
        }

        return res.status(200).json({ ...comprador, id_comprador: comprador.id_cliente });
    } catch (erro) {
        console.error("Erro ao buscar comprador por ID:", erro);
        return res.status(500).json({
            erro: "Erro interno ao buscar o comprador.",
            detalhes: erro.message
        });
    }
}

/**
 * @author Ian
 *
 * Edita os dados de um comprador. O cliente associado não pode ser trocado:
 * o id_cliente vem sempre do parâmetro da rota. O comprovante de renda é opcional;
 * se um novo arquivo for enviado, ele substitui o anterior, que é apagado do disco.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_comprador`, `req.body` e opcionalmente `req.file`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna o comprador atualizado ou um erro 400/404/500.
 */
async function editarComprador(req, res) {
    let atualizado = false;
    try {
        const id = obterIdComprador(req.params.id_comprador ?? req.params.id);
        if (id === null) {
            return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
        }

        if (req.file && req.file.size === 0) {
            return res.status(400).json({ erro: "O comprovante de renda enviado está vazio." });
        }

        const corpo = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : null;
        const { dados, erro } = validarDadosComprador(corpo && { ...corpo, id_cliente: String(id) });
        if (erro) {
            return res.status(400).json({ erro });
        }

        const compradorExistente = await prisma.comprador.findUnique({
            where: { id_cliente: id },
            select: { url_comprovante_renda: true }
        });
        if (!compradorExistente) {
            return res.status(404).json({ erro: "Comprador não encontrado!" });
        }

        // O cliente associado é fixo: id_cliente não entra nos dados atualizados.
        const { id_cliente, ...dadosAtualizados } = dados;
        if (req.file) {
            dadosAtualizados.url_comprovante_renda =
                `http://localhost:3000/uploads/comprovantes-renda/${req.file.filename}`;
        }

        const comprador = await prisma.comprador.update({
            where: { id_cliente: id },
            data: dadosAtualizados
        });
        atualizado = true;

        if (req.file) {
            const caminhoAntigo = caminhoComprovantePorUrl(compradorExistente.url_comprovante_renda);
            if (caminhoAntigo) {
                await removerComprovanteRenda({ path: caminhoAntigo });
            }
        }

        return res.status(200).json({ comprador });
    } catch (erro) {
        if (erro.code === "P2025") {
            return res.status(404).json({ erro: "Comprador não encontrado!" });
        }

        console.error("Erro ao editar comprador:", erro);
        return res.status(500).json({
            erro: "Não foi possível editar o comprador.",
            detalhes: erro.message
        });
    } finally {
        if (!atualizado) {
            await removerComprovanteRenda(req.file);
        }
    }
}

export {
    cadastrarComprador,
    editarComprador,
    excluirComprador,
    pesquisarComprador,
    buscarCompradorPorID
  };
