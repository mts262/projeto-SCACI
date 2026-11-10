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

export { pesquisarFuncionario };