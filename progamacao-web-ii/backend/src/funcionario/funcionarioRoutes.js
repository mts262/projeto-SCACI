import express from "express";
import {
  cadastrarFuncionario,
  editarFuncionario,
  excluirFuncionario,
  pesquisarFuncionario,
  buscarFuncionarioPorID
} from "./funcionarioController.js";

const router = express.Router();

// Cadastrar funcionario
router.post("/funcionario", cadastrarFuncionario);

// Listar / Pesquisar todos os funcionários
router.get("/funcionarios", pesquisarFuncionario);

// Buscar um funcionario por ID
router.get("/funcionario/:id_funcionario", buscarFuncionarioPorID);

// Editar funcionário por ID
router.put("/funcionario/:id_funcionario", editarFuncionario);

// Excluir funcionario por ID
router.delete("/funcionario/:id_funcionario", excluirFuncionario);

export default router;