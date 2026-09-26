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

export { cadastrarCorretor };