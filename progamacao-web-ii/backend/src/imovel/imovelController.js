import prisma from "../database.js";
import { unlink } from "node:fs/promises";

const URL_BASE_UPLOADS = "http://localhost:3000/uploads/";

/**
 * @author Ian
 *
 * Converte um parâmetro (rota ou corpo) em um ID numérico válido (INT UNSIGNED).
 *
 * @param {string} parametro - Valor recebido em `req.params`.
 * @returns {number|null} O ID numérico ou null se for inválido.
 */
function obterIdNumerico(parametro) {
    if (!/^\d+$/.test(String(parametro ?? ""))) {
        return null;
    }
    const id = Number(parametro);
    return id >= 1 && id <= 4_294_967_295 ? id : null;
}

/**
 * @author Ian
 *
 * Normaliza um campo de texto. Valores ausentes ou vazios viram null.
 *
 * @param {*} valor - Valor recebido no corpo da requisição.
 * @returns {string|null|undefined} Texto sem espaços nas pontas, null se vazio ou undefined se o tipo for inválido.
 */
function normalizarTexto(valor) {
    if (valor === undefined || valor === null) {
        return null;
    }
    if (typeof valor !== "string") {
        return undefined;
    }
    return valor.trim() || null;
}

/**
 * @author Ian
 *
 * Valida uma data no formato AAAA-MM-DD e a converte para Date (UTC).
 *
 * @param {*} valor - Valor recebido no corpo da requisição.
 * @returns {{ data: Date|null }|{ invalida: true }} A data convertida, null se vazia, ou a marcação de inválida.
 */
function converterData(valor) {
    const texto = normalizarTexto(valor);
    if (texto === null) {
        return { data: null };
    }
    if (texto === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(texto) || texto.slice(0, 4) < "1000") {
        return { invalida: true };
    }
    const data = new Date(`${texto}T00:00:00.000Z`);
    if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== texto) {
        return { invalida: true };
    }
    return { data };
}

/**
 * @author Ian
 *
 * Valida e normaliza os dados de um imóvel, do proprietário e da subtabela do tipo
 * (casa_ape ou terreno), respeitando os tamanhos e precisões do esquema do banco.
 *
 * @param {Object} corpo - Corpo da requisição (campos em snake_case, como no FormData da tela de imóvel).
 * @returns {{ dados: Object }|{ erro: string }} Os dados separados em `imovel`, `proprietario`,
 *          `casa_ape` e `terreno`, ou uma mensagem de erro.
 */
function validarDadosImovel(corpo) {
    if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
        return { erro: "Informe os dados do imóvel." };
    }

    if (!["casa_ape", "terreno"].includes(corpo.tipo_imovel)) {
        return { erro: "Informe o tipo do imóvel: casa_ape ou terreno." };
    }

    const imovel = { tipo_imovel: corpo.tipo_imovel };

    // [campo, tamanho máximo, obrigatório]
    const camposTexto = [
        ["matricula_imovel", 30, true],
        ["situacao_legal", 50, true],
        ["inscricao_iptu", 20, true],
        ["logradouro", 100, true],
        ["numero", 10, true],
        ["bairro", 100, true],
        ["cidade", 100, true],
        ["complemento", 50, false],
        ["descricao_imovel", 255, false],
        ["observacao", 255, false]
    ];
    for (const [campo, limite, obrigatorio] of camposTexto) {
        const valor = normalizarTexto(corpo[campo]);
        if (valor === undefined || (valor !== null && valor.length > limite)) {
            return { erro: `O campo ${campo} deve ter até ${limite} caracteres.` };
        }
        if (obrigatorio && valor === null) {
            return { erro: `O campo ${campo} é obrigatório.` };
        }
        imovel[campo] = valor;
    }

    const uf = normalizarTexto(corpo.uf);
    if (!uf || !/^[A-Za-z]{2}$/.test(uf)) {
        return { erro: "Informe a UF com duas letras." };
    }
    imovel.uf = uf.toUpperCase();

    const cep = typeof corpo.cep === "string" ? corpo.cep.replace(/\D/g, "") : "";
    if (cep.length !== 8) {
        return { erro: "Informe um CEP com 8 dígitos." };
    }
    imovel.cep = cep;

    // [campo, limite, obrigatório] — limites conforme DECIMAL do esquema
    const camposDecimais = [
        ["valor_venda", 99_999_999.99, true],
        ["valor_minimo_venda", 99_999_999.99, false],
        ["cotacao_imovel", 99_999_999.99, false],
        ["area_total", 9_999_999.99, false]
    ];
    for (const [campo, limite, obrigatorio] of camposDecimais) {
        const resultado = validarDecimal(corpo[campo], campo, limite, { obrigatorio });
        if (resultado.erro) {
            return resultado;
        }
        imovel[campo] = resultado.valor;
    }

    if (imovel.valor_minimo_venda !== null &&
        Number(imovel.valor_minimo_venda) > Number(imovel.valor_venda)) {
        return { erro: "O valor mínimo de venda não pode ser maior que o valor de venda." };
    }

    const disponibilidade = converterData(corpo.data_disponibilidade);
    if (disponibilidade.invalida) {
        return { erro: "Informe a data de disponibilidade no formato AAAA-MM-DD." };
    }
    imovel.data_disponibilidade = disponibilidade.data;

    // Proprietário (opcional no esquema)
    let proprietario = null;
    const idProprietarioTexto = normalizarTexto(
        typeof corpo.id_proprietario === "number" ? String(corpo.id_proprietario) : corpo.id_proprietario
    );
    if (idProprietarioTexto === undefined) {
        return { erro: "Selecione um proprietário válido." };
    }
    if (idProprietarioTexto !== null) {
        const idProprietario = obterIdNumerico(idProprietarioTexto);
        if (idProprietario === null) {
            return { erro: "Selecione um proprietário válido." };
        }

        const prazoVenda = converterData(corpo.prazo_venda);
        if (prazoVenda.invalida) {
            return { erro: "Informe o prazo de venda no formato AAAA-MM-DD." };
        }

        const observacaoProprietario = normalizarTexto(corpo.observacao_proprietario);
        if (observacaoProprietario === undefined ||
            (observacaoProprietario !== null && observacaoProprietario.length > 255)) {
            return { erro: "A observação do proprietário deve ter até 255 caracteres." };
        }

        proprietario = {
            id_cliente: idProprietario,
            prazo_venda: prazoVenda.data,
            observacao: observacaoProprietario
        };
    }
    imovel.id_proprietario = proprietario?.id_cliente ?? null;

    // Subtabela conforme o tipo
    let casaApe = null;
    let terreno = null;
    if (imovel.tipo_imovel === "casa_ape") {
        const iptu = validarDecimal(corpo.valor_iptu_anual, "valor_iptu_anual", 9_999.99,
            { obrigatorio: true, permiteZero: true });
        if (iptu.erro) {
            return iptu;
        }

        const condominio = validarDecimal(corpo.valor_condominio, "valor_condominio", 9_999.99,
            { permiteZero: true });
        if (condominio.erro) {
            return condominio;
        }

        const ultimoIptu = converterData(corpo.data_ultimo_iptu);
        if (ultimoIptu.invalida || ultimoIptu.data === null) {
            return { erro: "Informe a data do último IPTU no formato AAAA-MM-DD." };
        }
        const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
        if (ultimoIptu.data.toISOString().slice(0, 10) > hoje) {
            return { erro: "A data do último IPTU não pode ser uma data futura." };
        }

        casaApe = {
            valor_iptu_anual: iptu.valor,
            valor_condominio: condominio.valor,
            data_ultimo_iptu: ultimoIptu.data
        };
    } else {
        if (!["rural", "urbana"].includes(corpo.zona)) {
            return { erro: "Informe a zona do terreno: rural ou urbana." };
        }
        if (!["rural", "loteamento"].includes(corpo.tipo_terreno)) {
            return { erro: "Informe o tipo do terreno: rural ou loteamento." };
        }
        terreno = { zona: corpo.zona, tipo_terreno: corpo.tipo_terreno };
    }

    return { dados: { imovel, proprietario, casa_ape: casaApe, terreno } };
}

/**
 * @author Ian
 *
 * Valida um valor decimal com até duas casas, dentro do limite da coluna.
 *
 * @param {*} recebido - Valor recebido no corpo da requisição.
 * @param {string} campo - Nome do campo, usado na mensagem de erro.
 * @param {number} limite - Maior valor aceito pela coluna DECIMAL.
 * @param {{ obrigatorio?: boolean, permiteZero?: boolean }} opcoes - Regras do campo.
 * @returns {{ valor: string|null }|{ erro: string }} O valor como texto (para o Prisma Decimal) ou o erro.
 */
function validarDecimal(recebido, campo, limite, { obrigatorio = false, permiteZero = false } = {}) {
    const valor = typeof recebido === "string" ? recebido.trim() : recebido;
    if (valor === undefined || valor === null || valor === "") {
        return obrigatorio ? { erro: `O campo ${campo} é obrigatório.` } : { valor: null };
    }

    const minimoOk = permiteZero ? Number(valor) >= 0 : Number(valor) > 0;
    if (!["string", "number"].includes(typeof valor) ||
        !/^\d+(\.\d{1,2})?$/.test(String(valor)) ||
        !minimoOk || Number(valor) > limite) {
        const minimo = permiteZero ? "maior ou igual a zero" : "maior que zero";
        return { erro: `O campo ${campo} deve ser ${minimo}, até ${limite}, com até duas casas decimais.` };
    }
    return { valor: String(valor) };
}

/**
 * @author Ian
 *
 * Remove do disco os arquivos enviados pelo multer (ignora os que já não existem).
 *
 * @param {Array<Object>} arquivos - Lista de arquivos com a propriedade `path`.
 * @returns {Promise<void>}
 */
async function removerArquivos(arquivos) {
    for (const arquivo of arquivos) {
        if (!arquivo?.path) {
            continue;
        }
        try {
            await unlink(arquivo.path);
        } catch (erro) {
            if (erro.code !== "ENOENT") {
                console.error("Erro ao remover arquivo do imóvel:", erro);
            }
        }
    }
}

/**
 * @author Ian
 *
 * Converte a URL pública de um arquivo enviado no caminho relativo dele em disco.
 *
 * @param {string} url - URL salva no banco (ex.: http://localhost:3000/uploads/comprovantes-posse/arquivo.pdf).
 * @returns {string|null} Caminho relativo (ex.: uploads/comprovantes-posse/arquivo.pdf) ou null se não for um upload local.
 */
function caminhoArquivoPorUrl(url) {
    if (typeof url !== "string" || !url.startsWith(URL_BASE_UPLOADS)) {
        return null;
    }
    const relativo = url.slice(URL_BASE_UPLOADS.length);
    if (!/^[\w-]+\/[\w.-]+$/.test(relativo) || relativo.includes("..")) {
        return null;
    }
    return `uploads/${relativo}`;
}

/**
 * @author Ian
 *
 * Busca um único imóvel pelo seu ID, com proprietário, casa/apartamento e terreno.
 * Também devolve os dados do proprietário "achatados" (nome_proprietario, prazo_venda,
 * observacao_proprietario) para facilitar o preenchimento das telas.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_imovel` ou `req.params.id`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna `{ imovel }` ou um erro 400/404/500.
 */
async function buscarImovelPorID(req, res) {
    const id = obterIdNumerico(req.params.id_imovel ?? req.params.id);
    if (id === null) {
        return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
    }

    try {
        const imovel = await prisma.imovel.findUnique({
            where: { id_imovel: id },
            include: {
                casa_ape: true,
                terreno: true,
                proprietario: {
                    include: {
                        cliente: {
                            select: {
                                nome: true,
                                cpf_cnpj: true
                            }
                        }
                    }
                }
            }
        });

        if (!imovel) {
            return res.status(404).json({ erro: "Imóvel não encontrado!" });
        }

        return res.status(200).json({
            imovel: {
                ...imovel,
                nome_proprietario: imovel.proprietario?.cliente?.nome ?? null,
                cpf_cnpj_proprietario: imovel.proprietario?.cliente?.cpf_cnpj ?? null,
                prazo_venda: imovel.proprietario?.prazo_venda ?? null,
                observacao_proprietario: imovel.proprietario?.observacao ?? null
            }
        });
    } catch (erro) {
        console.error("Erro ao buscar imóvel por ID:", erro);
        return res.status(500).json({
            erro: "Erro interno ao buscar o imóvel.",
            detalhes: erro.message
        });
    }
}

/**
 * @author Ian
 *
 * Edita um imóvel, incluindo o proprietário (prazo de venda e observação) e os dados
 * específicos do tipo. Se o tipo mudar (casa_ape ↔ terreno), o registro da subtabela
 * antiga é removido e o da nova é criado, tudo na mesma transação.
 * O comprovante de posse e a certidão de matrícula são opcionais: se vierem novos,
 * substituem os anteriores, que são apagados do disco após a gravação.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_imovel`, `req.body` e opcionalmente `req.files`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna `{ imovel }` atualizado ou um erro 400/404/409/500.
 */
async function editarImovel(req, res) {
    const arquivoPosse = req.files?.comprovante_posse?.[0];
    const arquivoMatricula = req.files?.certidao_matricula?.[0];
    const arquivosNovos = [arquivoPosse, arquivoMatricula].filter(Boolean);
    let atualizado = false;

    try {
        const id = obterIdNumerico(req.params.id_imovel ?? req.params.id);
        if (id === null) {
            return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
        }

        if (arquivosNovos.some((arquivo) => arquivo.size === 0)) {
            return res.status(400).json({ erro: "O arquivo enviado está vazio." });
        }

        const { dados, erro } = validarDadosImovel(req.body);
        if (erro) {
            return res.status(400).json({ erro });
        }

        const imovelExistente = await prisma.imovel.findUnique({
            where: { id_imovel: id },
            select: { url_comprovante_posse: true, url_certidao_matricula: true }
        });
        if (!imovelExistente) {
            return res.status(404).json({ erro: "Imóvel não encontrado!" });
        }

        const dadosImovel = { ...dados.imovel };
        if (arquivoPosse) {
            dadosImovel.url_comprovante_posse =
                `${URL_BASE_UPLOADS}comprovantes-posse/${arquivoPosse.filename}`;
        }
        if (arquivoMatricula) {
            dadosImovel.url_certidao_matricula =
                `${URL_BASE_UPLOADS}certidoes-matricula/${arquivoMatricula.filename}`;
        }

        const imovel = await prisma.$transaction(async (tx) => {
            if (dados.proprietario) {
                const { id_cliente, ...dadosProprietario } = dados.proprietario;
                await tx.proprietario.upsert({
                    where: { id_cliente },
                    update: dadosProprietario,
                    create: dados.proprietario
                });
            }

            await tx.imovel.update({
                where: { id_imovel: id },
                data: dadosImovel
            });

            // Mantém só a subtabela do tipo atual
            if (dados.imovel.tipo_imovel === "casa_ape") {
                await tx.terreno.deleteMany({ where: { id_imovel: id } });
                await tx.casa_ape.upsert({
                    where: { id_imovel: id },
                    update: dados.casa_ape,
                    create: { ...dados.casa_ape, id_imovel: id }
                });
            } else {
                await tx.casa_ape.deleteMany({ where: { id_imovel: id } });
                await tx.terreno.upsert({
                    where: { id_imovel: id },
                    update: dados.terreno,
                    create: { ...dados.terreno, id_imovel: id }
                });
            }

            return tx.imovel.findUnique({
                where: { id_imovel: id },
                include: { casa_ape: true, terreno: true, proprietario: true }
            });
        });
        atualizado = true;

        // Arquivos substituídos só são apagados depois que a gravação deu certo
        const caminhosAntigos = [];
        if (arquivoPosse) {
            caminhosAntigos.push(caminhoArquivoPorUrl(imovelExistente.url_comprovante_posse));
        }
        if (arquivoMatricula) {
            caminhosAntigos.push(caminhoArquivoPorUrl(imovelExistente.url_certidao_matricula));
        }
        await removerArquivos(caminhosAntigos.filter(Boolean).map((caminho) => ({ path: caminho })));

        return res.status(200).json({ imovel });
    } catch (erro) {
        if (erro.code === "P2002") {
            return res.status(409).json({ erro: "Já existe outro imóvel cadastrado com essa matrícula." });
        }
        if (erro.code === "P2003") {
            return res.status(404).json({ erro: "Proprietário (cliente) não encontrado." });
        }
        if (erro.code === "P2025") {
            return res.status(404).json({ erro: "Imóvel não encontrado!" });
        }

        console.error("Erro ao editar imóvel:", erro);
        return res.status(500).json({
            erro: "Não foi possível editar o imóvel.",
            detalhes: erro.message
        });
    } finally {
        if (!atualizado) {
            await removerArquivos(arquivosNovos);
        }
    }
}

export { buscarImovelPorID, editarImovel };
