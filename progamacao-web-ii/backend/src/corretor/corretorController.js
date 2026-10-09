import prisma from "../database.js";

/**
 * @author Matheus Pereira Rodrigues
 *
 * Verifica se os campos obrigatórios (NOT NULL) do corretor foram devidamente preenchidos para o cadastro.
 *
 * @param {Object} dados - Objeto contendo os dados do corretor a serem verificados.
 * @returns {Array<string>} Array - contendo os nomes dos campos obrigatórios que não foram preenchidos.
 */
function verificarDadosCorretor(dados) {
    const obrigatorios = [
        "tipo",
        "creci_corretor",
        "nome",
        "cpf_cnpj",
        "telefone",
        "email",
    ];

    let faltando = [];

    for (const obrigatorio of obrigatorios) {
        const dado = dados[obrigatorio];

        if (dado === null || dado === "" || dado === undefined) {
            faltando.push(obrigatorio);
        }
    }

    return faltando;
}


/**
 * @author Matheus Pereira Rodrigues
 *
 * Insere um novo corretor no banco de dados.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.body`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna o status HTTP e os dados do corretor criado.
 */
async function cadastrarCorretor(req, res) {
    const dados = req.body;

    let faltando = verificarDadosCorretor(dados);

    if (faltando.length > 0) {
        return res.status(400).json({ erro: `Preencha todos os campos obrigatórios! (${faltando.join(", ")})` });
    }

    try {
        // valida CRECI duplicado
        const corretorCreciExistente = await prisma.corretor.findUnique({
            where: {creci_corretor: dados.creci_corretor }
        });

        if (corretorCreciExistente) {
            return res.status(400).json({ erro: 'Existe um corretor cadastrado com esse CRECI!' });
        }

        // Valida CPF/CNPJ duplicado
        const corretorCpfExistente = await prisma.corretor.findUnique({
            where: { cpf_cnpj: dados.cpf_cnpj }
        });

        if (corretorCpfExistente) {
            return res.status(400).json({ erro: 'Existe um corretor cadastrado com esse CPF/CNPJ!' });
        }

        // Valida email duplicado
        const corretorEmailExistente = await prisma.corretor.findUnique({
            where: { email: dados.email }
        })
            
        if (corretorEmailExistente) {
            return res.status(400).json({ erro: 'Existe um corretor cadastrado com esse email!' });
        }

        // Garante a correta conversão de data ISO evitando problemas de fuso horário, se data não for null
        let data = null;
        if (dados.data_nascimento) {
            data = new Date(`${dados.data_nascimento}T00:00:00.000Z`);
        }

        const corretor = await prisma.corretor.create({
            data: {
                tipo: dados.tipo,
                creci_corretor: dados.creci_corretor,
                nome: dados.nome,
                cpf_cnpj: dados.cpf_cnpj,
                data_nascimento: data,
                telefone: dados.telefone,
                email: dados.email,
                logradouro: dados.logradouro,
                numero: dados.numero,
                bairro: dados.bairro,
                complemento: dados.complemento,
                cidade: dados.cidade,
                uf: dados.uf,
                cep: dados.cep,
             }
        });

        return res.status(200).json({ corretor });

    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao inserir no banco', detalhes: error.message });
    }
}

/**
 * @author Pedro Lucas Dos Santos Xavier & Matheus Pereira Rodrigues
 *
 * Pesquisa e lista corretores cadastrados no sistema:
 * - Se nenhum parâmetro for informado na Query String: Retorna a lista completa de todos os corretores.
 * - Se informados nome, CPF/CNPJ e/ou CRECI: Aplica filtros dinâmicos de busca por texto parcial.
 * - Retorna os dados ordenados do mais recente para o mais antigo.
 *
 * @param {Object} req - Objeto de requisição do Express (espera parâmetros opcionais em `req.query`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna a lista de corretores encontrados em formato JSON com status HTTP 200.
 */
async function pesquisarCorretor(req, res) {
  try {
    const {q, nome, cpf_cnpj, creci_corretor , tipo} = req.query;
    const where = {};

    if (q && q.trim() !== "") {
      const termo = q.trim();
      where.OR = [
        { nome: { contains: termo } },
        { cpf_cnpj: { contains: termo } },
        { creci_corretor: { contains: termo } }
      ];
    }
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
    if (creci_corretor && creci_corretor.trim() !== "") {
      where.creci_corretor = {
        contains: creci_corretor.trim(),
      };
    }
    if (tipo && tipo.trim() !== "") {
      where.tipo = tipo.trim();
    }
    const corretores = await prisma.corretor.findMany({
      where,
      orderBy: {
        id_corretor: "desc",
      },
    });
    return res.status(200).json(corretores);
  } catch (erro) {
    console.error("Erro ao pesquisar corretores:", erro);
    return res.status(500).json({
      erro: "Erro interno ao buscar corretores",
      detalhes: erro.message,
    });
  }
}

/**
 * @author Matheus Pereira Rodrigues
 *
 * Exclui um corretor do banco de dados pelo seu ID.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_corretor` ou `req.params.id`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna mensagem de sucesso ou mensagem de erro.
 */
async function excluirCorretor(req, res) {
    const id = Number(req.params.id_corretor || req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
    }

    try {
        const corretor = await prisma.corretor.findUnique({
            where: {
                id_corretor: id
            }
        });

        if (!corretor) {
            return res.status(404).json({erro: "Corretor não encontrado!"});
        }

        await prisma.corretor.delete({
            where: {
                id_corretor: id
            }
        });

        return res.status(200).json({ mensagem: 'Corretor excluído com sucesso!' });

    } catch (error) {
        console.error("Erro ao excluir corretor:", error);

    return res.status(500).json({
        erro: "Erro ao excluir o corretor!",
        detalhes: error.message
    });
    }
}
/**
 * @author Pedro Lucas Dos Santos Xavier
 *
 * Busca um único corretor pelo seu ID.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id` ou `req.params.id_corretor`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna os dados do corretor encontrado ou um erro 404/400.
 */
async function buscarCorretorPorID(req, res) {
  
    const id = Number(req.params.id || req.params.id_corretor);

    if (isNaN(id)) {
        return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
    }

    try {
        const corretor = await prisma.corretor.findUnique({
            where: {
                id_corretor: id 
            }
        });
        
        if (!corretor) {
            return res.status(404).json({ erro: "Corretor não encontrado!" });
        }

        return res.status(200).json(corretor);
    } catch (error) {
        console.error("Erro ao buscar corretor por ID:", error);
        return res.status(500).json({
            erro: "Erro interno ao buscar o corretor",
            detalhes: error.message
        });
    }
}
/**
 * @author Pedro Lucas Dos Santos Xavier
 *
 * Edita os dados de corretor no banco de dados
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id` ou `req.params.id_corretor`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna os dados do corretor atualizado ou um erro 404/400.
 */
async function editarCorretor(req, res) {
    const id = Number(req.params.id || req.params.id_corretor);
    const dados = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ mensagem: "O ID fornecido deve ser um número válido." });
    }

    const camposFaltando = verificarDadosCorretor(dados);
    if (camposFaltando.length > 0) {
        return res.status(400).json({ 
            mensagem: "Preencha todos os campos obrigatórios.", 
            camposFaltando 
        });
    }

    try {
        // Verifica diretamente no banco se o corretor existe antes de atualizar
        const corretorExistente = await prisma.corretor.findUnique({
            where: { id_corretor: id }
        });

        if (!corretorExistente) {
            return res.status(404).json({ mensagem: "Corretor não cadastrado" });
        }
        const creciDuplicado = await prisma.corretor.findFirst({
            where: {
                creci_corretor: dados.creci_corretor,
                NOT: { id_corretor: id }
            }
        });
        if (creciDuplicado) {
            return res.status(400).json({ erro: 'Existe outro corretor cadastrado com esse CRECI!' });
        }

        // 2. Verifica se o CPF/CNPJ já pertence a OUTRO corretor
        const cpfDuplicado = await prisma.corretor.findFirst({
            where: {
                cpf_cnpj: dados.cpf_cnpj,
                NOT: { id_corretor: id }
            }
        });
        if (cpfDuplicado) {
            return res.status(400).json({ erro: 'Existe outro corretor cadastrado com esse CPF/CNPJ!' });
        }

        // 3. Verifica se o E-mail já pertence a OUTRO corretor
        const emailDuplicado = await prisma.corretor.findFirst({
            where: {
                email: dados.email,
                NOT: { id_corretor: id }
            }
        });
        if (emailDuplicado) {
            return res.status(400).json({ erro: 'Existe outro corretor cadastrado com esse email!' });
        }
        // Tratamento seguro para a data de nascimento opcional
        let dataNascimentoFormatada = null;
        if (dados.data_nascimento && dados.data_nascimento.trim() !== "") {
            dataNascimentoFormatada = new Date(`${dados.data_nascimento}T00:00:00.000Z`);
        }

        const dadosAtualizados = {
            tipo: dados.tipo,
            creci_corretor: dados.creci_corretor,
            nome: dados.nome,
            cpf_cnpj: dados.cpf_cnpj,
            data_nascimento: dataNascimentoFormatada,
            telefone: dados.telefone,
            email: dados.email,
            cep: dados.cep || null,
            logradouro: dados.logradouro || null,
            numero: dados.numero || null,
            complemento: dados.complemento || null,
            bairro: dados.bairro || null,
            cidade: dados.cidade || null,
            uf: dados.uf || null
        };

        const corretorAtualizado = await prisma.corretor.update({
            where: { id_corretor: id }, 
            data: dadosAtualizados      
        });

        return res.status(200).json(corretorAtualizado);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Erro interno ao atualizar o corretor." });
    }
}

export { cadastrarCorretor, pesquisarCorretor, excluirCorretor, editarCorretor, buscarCorretorPorID };