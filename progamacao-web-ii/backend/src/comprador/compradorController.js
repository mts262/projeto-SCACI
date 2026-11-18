import prisma from "../database.js";

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
    //cadastrarComprador,
    //editarComprador,
    excluirComprador,
    //pesquisarComprador,
    //buscarCompradorPorID 
  };