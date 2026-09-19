import express from "express";
import { 
  cadastrarCliente, 
  editarCliente, 
  excluirCliente,
  // listarClientes // Descomente caso tenha criado a função de listagem/busca
} from "./clienteController.js";

const router = express.Router();

// Cadastrar cliente
router.post("/cliente", cadastrarCliente);

// Excluir cliente por ID
router.delete("/cliente/:id_cliente", excluirCliente);

// Editar cliente por ID
router.put("/cliente/:id_cliente", editarCliente);

// (Opcional) Listar / Buscar clientes
// router.get("/clientes", listarClientes);

export default router;