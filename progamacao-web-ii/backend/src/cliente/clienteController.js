import prisma from "../database.js";
import fs from "fs";
import path from "path";

/**
 * @author Matheus Pereira Rodrigues
 * Remove os arquivos enviados pelo cliente quando o cadastro não é concluído.
 *
 * @param {Object} arquivosCliente - Arquivos recebidos pelo Multer.
 * @returns {void}
 */
function excluirArquivosUpload(arquivosCliente) {
    if (arquivosCliente?.comprovante_residencia?.[0]) {
        fs.unlinkSync(arquivosCliente.comprovante_residencia[0].path);
    }

    if (arquivosCliente?.comprovante_uniao?.[0]) {
        fs.unlinkSync(arquivosCliente.comprovante_uniao[0].path);
    }
}

/**
 * @author Matheus Pereira Rodrigues
 *
 * Verifica se os campos obrigatórios (NOT NULL) do cliente foram devidamente preenchidos para o cadastro.
 *
 * @param {Object} dados - Objeto contendo os dados do cliente e do cônjuge a serem verificados.
 * @param {boolean} casado - Flag booleana indicando se o cliente possui estado civil "casado".
 * @returns {Array<string>} Array contendo os nomes dos campos obrigatórios que não foram preenchidos.
 */
function verificarDadosCliente(dados, casado, arquivosCliente) {
    const obrigatorios = [
        "nome",
        "cpf_cnpj",
        "data_nascimento",
        "telefone",
        "logradouro",
        "numero",
        "bairro",
        "cidade",
        "uf",
        "cep",
        "estado_civil"
    ];

    if (casado) {
        obrigatorios.push(
            "conjuge_cpf",
            "conjuge_nome",
            "regime_bens",
            "data_casamento",
            "casamento_ativo"
        );
    }

    let faltando = [];

    for (const obrigatorio of obrigatorios) {
        const dado = dados[obrigatorio];

        if (dado === null || dado === "" || dado === undefined) {
            faltando.push(obrigatorio);
        }
    }

    if (!arquivosCliente?.comprovante_residencia) {
        faltando.push("Comprovante_residencia");
    }

    if (casado) {
        if (!arquivosCliente?.comprovante_uniao) {
            faltando.push("Comprovante_uniao");
        }
    }

    return faltando;
}

/**
 * @author Pedro Lucas Dos Santos Xavier
 *
 * Valida os dados recebidos para a edição de um cliente.
 * Garante que a requisição não esteja vazia e ignora campos vazios de upload que não foram alterados.
 *
 * @param {Object} dados - Objeto contendo os campos do cliente e cônjuge a serem atualizados (req.body).
 * @returns {string|null} Retorna mensagem descritiva do erro ou null caso a validação seja bem-sucedida.
 */
function verificarDadosEdicaoCliente(dados) {
    if (!dados || Object.keys(dados).length === 0) {
        return "Forneça pelo menos um campo para atualizar";
    }

    // Campos de arquivo e campos opcionais que podem vir vazios na edição do formulário
    const camposIgnoradosNaValidacao = ["comprovante_residencia", "comprovante_uniao", "complemento", "email"];

    for (const [campo, valor] of Object.entries(dados)) {
        // Ignora a validação de campos vazios para uploads ou campos opcionais
        if (camposIgnoradosNaValidacao.includes(campo)) {
            continue;
        }

        if (valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '')) {
            return `O campo ${campo} não pode ser vazio`;
        }
    }
    return null;
}
/**
 * @author Matheus Pereira Rodrigues
 *
 * Cadastra um novo cônjuge no banco de dados atrelado a um cliente dentro de um contexto transacional.
 *
 * @param {Object} dados - Objeto contendo os dados do cônjuge a serem inseridos.
 * @param {number} id_cliente - Chave primária do cliente proprietário do relacionamento.
 * @param {Object} tx - Instância da transação do Prisma Client ($transaction).
 * @returns {Promise<Object>} Retorna o registro do cônjuge criado.
 */
async function cadastrarConjuge(dados, arquivosCliente, id_cliente, tx = prisma) {
    const arquivo = arquivosCliente.comprovante_uniao[0];

    const urlComprovante = `http://localhost:3000/uploads/comprovantes-uniao/${arquivo.filename}`;

    return await tx.conjuge.create({
        data: {
            cpf: dados.conjuge_cpf || dados.cpf,
            nome: dados.conjuge_nome || dados.nome,
            regime_bens: dados.regime_bens,
            data_nascimento: (dados.conjuge_data_nascimento || dados.data_nascimento) ? new Date(dados.conjuge_data_nascimento || dados.data_nascimento) : null,
            url_comprovante_uniao: urlComprovante,
            data_casamento: new Date(dados.data_casamento),
            casamento_ativo: dados.casamento_ativo || "sim",
            data_fim_casamento: dados.data_fim_casamento ? new Date(dados.data_fim_casamento) : null,
            id_cliente: id_cliente
        }
    });
}

/**
 * @author Matheus Pereira Rodrigues
 *
 * Insere um novo cliente no banco de dados e, se aplicável, cadastra seu cônjuge inicial em uma transação atômica.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.body`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna o status HTTP e os dados do cliente criado com o histórico de cônjuges.
 */
async function cadastrarCliente(req, res) {
    const dados = req.body;
    const arquivosCliente = req.files;

    let casado = (dados.estado_civil === "casado");

    let faltando = verificarDadosCliente(dados, casado, arquivosCliente);

    if (faltando.length > 0) {
        excluirArquivosUpload(arquivosCliente);
        return res.status(400).json({ erro: `Preencha todos os campos obrigatórios! (${faltando.join(", ")})` });
    }

    try {
        // Valida CPF/CNPJ duplicado
        const clienteCpfExistente = await prisma.cliente.findUnique({
            where: { cpf_cnpj: dados.cpf_cnpj }
        });

        if (clienteCpfExistente) {
            excluirArquivosUpload(arquivosCliente);
            return res.status(400).json({ erro: 'Existe um cliente cadastrado com esse CPF!' });
        }

        const email = dados.email?.trim() || null;
        if (email) {
            const clienteEmailExistente = await prisma.cliente.findUnique({
            where: { email: email }
        });

            if (clienteEmailExistente) {
                excluirArquivosUpload(arquivosCliente);
                return res.status(400).json({ erro: 'Existe um cliente cadastrado com esse email!'});
            }
        }

        // pega o arquivo que o cliente enviou
        const arquivo = arquivosCliente.comprovante_residencia[0];

        // URL local do arquivo salvo pelo Multer
        const urlComprovante = `http://localhost:3000/uploads/comprovantes-residencia/${arquivo.filename}`;

        const resultado = await prisma.$transaction(async (tx) => {
            const cliente = await tx.cliente.create({
                data: {
                    nome: dados.nome,
                    cpf_cnpj: dados.cpf_cnpj,
                    // Garante a correta conversão de data ISO evitando problemas de fuso horário
                    data_nascimento: new Date(`${dados.data_nascimento}T00:00:00.000Z`),
                    telefone: dados.telefone,
                    email: email,
                    url_comprovante_residencia: urlComprovante,
                    logradouro: dados.logradouro,
                    numero: dados.numero,
                    bairro: dados.bairro,
                    complemento: dados.complemento,
                    cidade: dados.cidade,
                    uf: dados.uf,
                    cep: dados.cep,
                    estado_civil: dados.estado_civil
                }
            });

            if (casado) {
                await cadastrarConjuge(dados, arquivosCliente, cliente.id_cliente, tx);
            }

            return await tx.cliente.findUnique({
                where: { id_cliente: cliente.id_cliente },
                include: {
                    conjuge: {
                        orderBy: { data_casamento: 'desc' }
                    }
                }
            });
        });

        return res.status(200).json({ cliente: resultado });

    } catch (error) {
        excluirArquivosUpload(arquivosCliente);
        return res.status(500).json({ erro: 'Erro ao inserir no banco', detalhes: error.message });
    }
}

/**
 * @author Pedro Lucas Dos Santos Xavier
 *
 * Busca um cliente pelo ID e retorna suas informações cadastrais acompanhadas
 * do histórico de cônjuges ordenado do mais recente para o mais antigo.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna o cliente com array de cônjuges ou mensagem de erro.
 */
async function buscarClientePorId(req, res) {
    const id = Number(req.params.id || req.params.id_cliente);

    if (isNaN(id)) {
        return res.status(400).json({ mensagem: "O ID fornecido deve ser um número válido." });
    }

    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id_cliente: id },
            include: {
                conjuge: {
                    orderBy: { data_casamento: 'desc' }
                }
            }
        });

        if (!cliente) {
            return res.status(404).json({ mensagem: "Cliente não encontrado." });
        }

        return res.status(200).json(cliente);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao buscar cliente.", detalhes: error.message });
    }
}

/**
 * @author Pedro Lucas Dos Santos Xavier & Matheus Pereira Rodrigues
 *
 * Atualiza os dados de um cliente existente e gerencia as regras de negócio de estado civil, 
 * cônjuges e substituição de arquivos (comprovantes).
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id` e `req.body`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna o cliente atualizado com o histórico completo de cônjuges.
 */
async function editarCliente(req, res) {
    const id = Number(req.params.id || req.params.id_cliente);

    if (isNaN(id)) {
        return res.status(400).json({ mensagem: "O ID fornecido deve ser um número válido." });
    }

    const dadosAtuais = { ...req.body };
    const arquivosCliente = req.files;

    // 1. Converte o objeto do cônjuge caso tenha sido enviado como string JSON via FormData
    if (typeof dadosAtuais.conjuge === 'string') {
        try {
            dadosAtuais.conjuge = JSON.parse(dadosAtuais.conjuge);
        } catch (e) {
            console.error("Erro ao fazer parse do objeto conjuge:", e);
        }
    }

    // 2. Processa a substituição do comprovante de residência se um novo arquivo foi enviado
    if (arquivosCliente?.comprovante_residencia?.[0]) {
        const arqResidencia = arquivosCliente.comprovante_residencia[0];
        dadosAtuais.url_comprovante_residencia = `http://localhost:3000/uploads/comprovantes-residencia/${arqResidencia.filename}`;
    }

    // Separa o cônjuge dos dados do cliente
    const { conjuge, ...dadosCliente } = dadosAtuais;

    // 3. Validação dos campos do cliente
    const erro = verificarDadosEdicaoCliente(dadosCliente);
    if (erro) {
        // Se a validação falhar, apaga os novos arquivos recebidos para não acumular lixo no disco
        excluirArquivosUpload(arquivosCliente);
        return res.status(400).json({ mensagem: erro });
    }

    // Treatmento de conversão de datas para os campos do cliente
    if (dadosCliente.data_nascimento) {
        dadosCliente.data_nascimento = new Date(dadosCliente.data_nascimento);
    }

    // 4. Processa a substituição do comprovante de união caso exista cônjuge e novo arquivo
    if (arquivosCliente?.comprovante_uniao?.[0] && conjuge) {
        const arqUniao = arquivosCliente.comprovante_uniao[0];
        conjuge.url_comprovante_uniao = `http://localhost:3000/uploads/comprovantes-uniao/${arqUniao.filename}`;
    }

    try {
        const clienteAtualizado = await prisma.$transaction(async (tx) => {

            // 1. Atualiza dados cadastrais do cliente (incluindo a nova URL de residência, se houver)
            if (Object.keys(dadosCliente).length > 0) {
                await tx.cliente.update({
                    where: { id_cliente: id },
                    data: dadosCliente
                });
            }

            // 2. REGRA DE NEGÓCIO: Divórcio
            if (dadosCliente.estado_civil === "divorciado") {
                const conjugeAtivo = await tx.conjuge.findFirst({
                    where: { id_cliente: id, casamento_ativo: "sim" }
                });

                if (conjugeAtivo) {
                    const dataFim = (conjuge && conjuge.data_fim_casamento)
                        ? new Date(conjuge.data_fim_casamento)
                        : new Date();

                    await tx.conjuge.update({
                        where: {
                            id_cliente_cpf: { id_cliente: id, cpf: conjugeAtivo.cpf }
                        },
                        data: {
                            casamento_ativo: "nao",
                            data_fim_casamento: dataFim
                        }
                    });
                }
            }

            // 3. REGRA DE NEGÓCIO: Edição ou Novo Cadastro de Cônjuge
            if (conjuge && (conjuge.cpf || conjuge.conjuge_cpf)) {
                const cpfConjuge = conjuge.cpf || conjuge.conjuge_cpf;

                const conjugeExistente = await tx.conjuge.findFirst({
                    where: { id_cliente: id, cpf: cpfConjuge }
                });

                if (conjugeExistente) {
                    // Edição do cônjuge existente (substitui a URL se um novo comprovante foi enviado)
                    await tx.conjuge.update({
                        where: { id_cliente_cpf: { id_cliente: id, cpf: cpfConjuge } },
                        data: {
                            nome: conjuge.nome || conjuge.conjuge_nome || conjugeExistente.nome,
                            regime_bens: conjuge.regime_bens || conjugeExistente.regime_bens,
                            url_comprovante_uniao: conjuge.url_comprovante_uniao || conjugeExistente.url_comprovante_uniao,
                            data_nascimento: conjuge.data_nascimento ? new Date(conjuge.data_nascimento) : undefined,
                            data_casamento: conjuge.data_casamento ? new Date(conjuge.data_casamento) : undefined,
                            casamento_ativo: conjuge.casamento_ativo || conjugeExistente.casamento_ativo,
                            data_fim_casamento: conjuge.data_fim_casamento ? new Date(conjuge.data_fim_casamento) : undefined
                        }
                    });
                } else {
                    // Novo casamento: Inativa o casamento anterior e insere o novo
                    await tx.conjuge.updateMany({
                        where: { id_cliente: id, casamento_ativo: "sim" },
                        data: {
                            casamento_ativo: "nao",
                            data_fim_casamento: conjuge.data_casamento ? new Date(conjuge.data_casamento) : new Date()
                        }
                    });

                    await tx.conjuge.create({
                        data: {
                            id_cliente: id,
                            cpf: cpfConjuge,
                            nome: conjuge.nome || conjuge.conjuge_nome,
                            regime_bens: conjuge.regime_bens,
                            data_nascimento: conjuge.data_nascimento ? new Date(conjuge.data_nascimento) : null,
                            url_comprovante_uniao: conjuge.url_comprovante_uniao || null,
                            data_casamento: new Date(conjuge.data_casamento),
                            casamento_ativo: "sim"
                        }
                    });
                }
            }

            // 4. Retorna o cliente atualizado trazendo a lista de cônjuges ordenada
            return await tx.cliente.findUnique({
                where: { id_cliente: id },
                include: {
                    conjuge: {
                        orderBy: { data_casamento: 'desc' }
                    }
                }
            });
        });

        return res.status(200).json(clienteAtualizado);

    } catch (error) {
        // Se houver erro no banco de dados, limpa os arquivos salvos pelo Multer nessa requisição
        excluirArquivosUpload(arquivosCliente);

        if (error.code === 'P2025') {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }
        return res.status(500).json({ erro: 'Erro ao atualizar no banco', detalhes: error.message });
    }
}

/**
 * @author Matheus Pereira Rodrigues
 * 
 * Exclui da pasta uploads os arquivos de clientes que serão excluídos do BD
 * 
 * @param {Object} cliente - o clinete que será excluído
 */
function excluirArquivosCliente(cliente) {
    if (cliente.url_comprovante_residencia) {
        const nomeArquivo = path.basename(
            new URL(cliente.url_comprovante_residencia).pathname
        );

        const caminho = path.join(
            "uploads",
            "comprovantes-residencia",
            nomeArquivo
        );

        if (fs.existsSync(caminho)) {
            fs.unlinkSync(caminho);
        }
    }

    for (const conjuge of cliente.conjuge) {
        if (conjuge.url_comprovante_uniao) {
            const nomeArquivo = path.basename(
                new URL(conjuge.url_comprovante_uniao).pathname
            );

            const caminho = path.join(
                "uploads",
                "comprovantes-uniao",
                nomeArquivo
            );

            if (fs.existsSync(caminho)) {
                fs.unlinkSync(caminho);
            }
        }
    }
}

/**
 * @author Matheus Pereira Rodrigues
 *
 * Exclui um cliente do banco de dados pelo seu ID.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_cliente` ou `req.params.id`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna mensagem de sucesso ou mensagem de erro.
 */
async function excluirCliente(req, res) {
    const id = Number(req.params.id_cliente || req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
    }

    try {
        const cliente = await prisma.cliente.findUnique({
            where: {
                id_cliente: id
            },
            include: {
                conjuge: true
            }
        });

        if (!cliente) {
            return res.status(404).json({erro: "Cliente não encontrado!"});
        }

        await prisma.cliente.delete({
            where: {
                id_cliente: id
            }
        });

        excluirArquivosCliente(cliente);

        return res.status(200).json({ mensagem: 'Cliente excluído com sucesso!' });

    } catch (error) {
        console.error("Erro ao excluir cliente:", error);

    return res.status(500).json({
        erro: "Erro ao excluir o cliente!",
        detalhes: error.message
    });
    }
}

/**
 * @author Pedro Lucas Dos Santos Xavier
 *
 * Pesquisa e lista clientes cadastrados no sistema:
 * - Se nenhum parâmetro for informado na Query String: Retorna a lista completa de todos os clientes.
 * - Se informados nome e/ou CPF/CNPJ: Aplica filtros dinâmicos de busca por texto parcial.
 * - Retorna os dados ordenados do mais recente para o mais antigo, incluindo o histórico/dados do cônjuge.
 *
 * @param {Object} req - Objeto de requisição do Express (espera parâmetros opcionais em `req.query`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna a lista de clientes encontrados em formato JSON com status HTTP 200.
 */
async function pesquisarCliente(req, res) {
  try {
    const { nome, cpf_cnpj } = req.query;
    const where = {};


    if (nome && nome.trim() !== "") {
      where.nome = {
        contains: nome.trim(),
      };
    }
    if (cpf_cnpj && cpf_cnpj.trim() !== "") {
      where.cpf_cnpj = {
        contains: cpf_cnpj.trim(),
      };
    }
    const clientes = await prisma.cliente.findMany({
      where,
      include: {
        conjuge: true,
      },
      orderBy: {
        id_cliente: "desc",
      },
    });
    return res.status(200).json(clientes);
  } catch (erro) {
    console.error("Erro ao pesquisar clientes:", erro);
    return res.status(500).json({
      erro: "Erro interno ao buscar clientes",
      detalhes: erro.message,
    });
  }
}


export { cadastrarCliente, buscarClientePorId, editarCliente, excluirCliente, pesquisarCliente };