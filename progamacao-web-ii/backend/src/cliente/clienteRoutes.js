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

const camposUpload = upload.fields([
  { name: "comprovante_residencia", maxCount: 1 },
  { name: "comprovante_uniao", maxCount: 1 }
]);

// Cadastrar cliente
router.post("/cliente", camposUpload, cadastrarCliente);

// Listar / Pesquisar todos os clientes
router.get("/clientes", pesquisarCliente);

// Buscar um cliente por ID
router.get("/cliente/:id_cliente", buscarClientePorId);

// Editar cliente por ID
router.put("/cliente/:id_cliente", camposUpload, editarCliente);

// Excluir cliente por ID
router.delete("/cliente/:id_cliente", excluirCliente);

export default router;