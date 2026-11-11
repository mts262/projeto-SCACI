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

function obterIdFuncionario(parametro) {
    const id = Number(parametro);
    if (!/^\d+$/.test(parametro) || id < 1 || id > 4_294_967_295) {
        return null;
    }
    return id;
}

async function buscarFuncionarioPorID(req, res) {
    const idFuncionario = obterIdFuncionario(req.params.id_funcionario);
    if (idFuncionario === null) {
        return res.status(400).json({ erro: "ID do funcionário inválido." });
    }

    try {
        const funcionario = await prisma.funcionario.findUnique({
            where: { id_funcionario: idFuncionario },
        });

        if (!funcionario) {
            return res.status(404).json({ erro: "Funcionário não encontrado." });
        }

        return res.status(200).json(funcionario);
    } catch (erro) {
        console.error("Erro ao buscar funcionário:", erro);
        return res.status(500).json({ erro: "Não foi possível buscar o funcionário." });
    }
}

function validarEdicaoFuncionario(corpo) {
    if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
        return { erro: "Envie os campos do funcionário em JSON." };
    }

    const faltando = verificarDadosFuncionário(corpo);
    if (faltando.length > 0) {
        return { erro: `Preencha todos os campos obrigatórios! (${faltando.join(", ")})` };
    }

    const limitesDeTexto = { nome: 100, cpf: 11, funcao: 50, email: 200, telefone: 20 };
    const dados = {};

    for (const [campo, valorRecebido] of Object.entries(corpo)) {
        const valor = typeof valorRecebido === "string" ? valorRecebido.trim() : valorRecebido;

        if (campo === "salario") {
            const salario = typeof valor === "number" ? String(valor) : valor;
            if (typeof salario !== "string" || !/^\d+(\.\d{1,2})?$/.test(salario) || Number(salario) > 99_999.99) {
                return { erro: "Informe um salário entre 0 e 99999,99, com até duas casas decimais." };
            }
            dados.salario = salario;
            continue;
        }

        if (!Object.hasOwn(limitesDeTexto, campo)) {
            return { erro: "A edição contém um campo não permitido." };
        }

        if (campo === "funcao" && (valor === null || valor === "")) {
            dados.funcao = null;
            continue;
        }

        const limite = limitesDeTexto[campo];
        if (typeof valor !== "string" || !valor || valor.length > limite) {
            return { erro: `O campo ${campo} deve ter de 1 a ${limite} caracteres.` };
        }

        if (campo === "cpf" && !/^\d{11}$/.test(valor)) {
            return { erro: "Informe os 11 dígitos do CPF." };
        }

        if (campo === "email" && !/^[^\s@]+@[^\s@]+$/.test(valor)) {
            return { erro: "Informe um e-mail válido." };
        }

        dados[campo] = valor;
    }

    return { dados };
}

async function editarFuncionario(req, res) {
    const idFuncionario = obterIdFuncionario(req.params.id_funcionario);
    if (idFuncionario === null) {
        return res.status(400).json({ erro: "ID do funcionário inválido." });
    }

    const { dados, erro } = validarEdicaoFuncionario(req.body);
    if (erro) {
        return res.status(400).json({ erro });
    }

    try {
        const funcionario = await prisma.funcionario.update({
            where: { id_funcionario: idFuncionario },
            data: dados,
        });

        return res.status(200).json(funcionario);
    } catch (erro) {
        if (erro.code === "P2025") {
            return res.status(404).json({ erro: "Funcionário não encontrado." });
        }
        if (erro.code === "P2002") {
            return res.status(409).json({ erro: "CPF ou e-mail já cadastrado para outro funcionário." });
        }

        console.error("Erro ao atualizar funcionário:", erro);
        return res.status(500).json({ erro: "Não foi possível salvar a edição." });
    }
}

/**
 * @author Davi Oliveira Ferreira Santos
 *
 * Exclui um funcionario do banco de dados pelo seu ID.
 *
 * @param {Object} req - Objeto de requisição do Express (espera `req.params.id_funcionario` ou `req.params.id`).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Promise<Object>} Retorna mensagem de sucesso ou mensagem de erro.
 */
async function excluirFuncionario(req, res) {
    const id = Number(req.params.id_funcionario || req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ erro: "O ID fornecido deve ser um número válido." });
    }

    try {
        const funcionario = await prisma.funcionario.findUnique({
            where: {
                id_funcionario: id
            }
        });

        if (!funcionario) {
            return res.status(404).json({erro: "Funcionário não encontrado!"});
        }

        await prisma.funcionario.delete({
            where: {
                id_funcionario: id
            }
        });

        return res.status(200).json({ mensagem: 'Funcionário excluído com sucesso!' });

    } catch (error) {
        console.error("Erro ao excluir funcionário:", error);

    return res.status(500).json({
        erro: "Erro ao excluir o funcionário!",
        detalhes: error.message
    });
    }
}

export { 
    cadastrarFuncionario,
    editarFuncionario,
    excluirFuncionario,
    pesquisarFuncionario,
    buscarFuncionarioPorID 
  };
