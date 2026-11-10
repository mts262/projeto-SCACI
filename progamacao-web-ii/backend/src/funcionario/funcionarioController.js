import prisma from "../database.js";

/**
 * @author Matheus Pereira Rodrigues
 *
 * Verifica se os campos obrigatórios (NOT NULL) do funcionário foram devidamente preenchidos para o cadastro.
 *
 * @param {Object} dados - Objeto contendo os dados do funcionário a serem verificados.
 * @returns {Array<string>} Array - contendo os nomes dos campos obrigatórios que não foram preenchidos.
 */
function verificarDadosFuncionário(dados) {
    const obrigatorios = [
        "nome",
        "cpf",
        "salario",
        "email",
        "telefone"
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
 * Insere um novo funcionário no banco de dados.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.body`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna o status HTTP e os dados do funcionário criado.
 */
async function cadastrarFuncionario(req, res) {
    const dados = req.body;

    let faltando = verificarDadosFuncionário(dados);

    if (faltando.length > 0) {
        return res.status(400).json({ erro: `Preencha todos os campos obrigatórios! (${faltando.join(", ")})` });
    }

    try {

        // Valida CPF duplicado
        const funcionarioCpfExistente = await prisma.funcionario.findUnique({
            where: { cpf: dados.cpf }
        });

        if (funcionarioCpfExistente) {
            return res.status(400).json({ erro: 'Existe um funcionário cadastrado com esse CPF!' });
        }

        // Valida email duplicado
        const funcionarioEmailExistente = await prisma.funcionario.findUnique({
            where: { email: dados.email }
        })
            
        if (funcionarioEmailExistente) {
            return res.status(400).json({ erro: 'Existe um funcionário cadastrado com esse email!' });
        }

        const funcionario = await prisma.funcionario.create({
            data: {
                nome: dados.nome,
                cpf: dados.cpf,
                salario: dados.salario,
                funcao: dados.funcao,
                email: dados.email,
                telefone: dados.telefone,
             }
        });

        return res.status(200).json({ funcionario });

    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao inserir no banco', detalhes: error.message });
    }
}

/**
 * @author Matheus Pereira Rodrigues
 *
 * Pesquisa e lista funcionários cadastrados no sistema:
 * - Se nenhum parâmetro for informado na Query String: Retorna a lista completa de todos os funcionarios.
 * - Se informados nome, CPF ou função: Aplica filtros dinâmicos de busca por texto parcial.
 * - Retorna os dados ordenados do mais recente para o mais antigo.
 *
 * @param {Object} req - Objeto de requisição do Express (espera parâmetros opcionais em `req.query`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna a lista de funcionários encontrados em formato JSON com status HTTP 200.
 */
async function pesquisarFuncionario(req, res) {
  try {
    const { q, nome, cpf, funcao, salarioMin, salarioMax } = req.query;
    const where = {};

    if (q && q.trim() !== "") {
      const termo = q.trim();
      where.OR = [
        { nome: { contains: termo } },
        { cpf: { contains: termo } },
        { funcao: { contains: termo } }
      ];
    }

    if (nome && nome.trim() !== "") {
      where.nome = {
        contains: nome.trim(),
      };
    }

    if (cpf && cpf.trim() !== "") {
      where.cpf = {
        contains: cpf.trim(),
      };
    }

    if (funcao && funcao.trim() !== "") {
      where.funcao = {
        contains: funcao.trim(),
      };
    }

    const paraNumero = (valor) => {
    if (typeof valor !== "string" || valor.trim() === "") return null;
    const numero = Number(valor.trim().replace(",", "."));
    return Number.isFinite(numero) ? numero : null;
    };

    const min = paraNumero(salarioMin);
    const max = paraNumero(salarioMax);

    if (min !== null && max !== null && min > max) {
    return res.status(400).json({
        erro: "O salário mínimo não pode ser maior que o máximo.",
    });
    }

    if (min !== null || max !== null) {
    where.salario = {
        ...(min !== null && { gte: min }),
        ...(max !== null && { lte: max }),
    };
    }
    
    const funcionarios = await prisma.funcionario.findMany({
      where,
      orderBy: {
        id_funcionario: "desc",
      },
    });

    return res.status(200).json(funcionarios);

  } catch (erro) {
    console.error("Erro ao pesquisar funcionários:", erro);
    return res.status(500).json({
      erro: "Erro interno ao buscar funcionários",
      detalhes: erro.message,
    });
  }
}

export { 
    cadastrarFuncionario,
    //editarFuncionario,
    //excluirFuncionario,
    pesquisarFuncionario,
    //buscarFuncionarioPorID 
  };