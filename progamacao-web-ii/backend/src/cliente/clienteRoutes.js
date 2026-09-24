import express from "express";
import {
  cadastrarCliente,
  editarCliente,
  excluirCliente,
  pesquisarCliente,
  buscarClientePorId 
} from "./clienteController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Cadastrar cliente
router.post(
    "/cliente",
    upload.fields([
        { name: "comprovante_residencia", maxCount: 1 },
        { name: "comprovante_uniao", maxCount: 1 }
    ]),
    cadastrarCliente
);

// Excluir cliente por ID
router.delete("/cliente/:id_cliente", excluirCliente);

// Editar cliente por ID
router.put("/cliente/:id_cliente", editarCliente);

// Listar / Buscar clientes
router.get("/clientes", pesquisarCliente);

// Busca um cliente pelo seu id
router.get("/cliente/:id_cliente", buscarClientePorId);

export default router;
