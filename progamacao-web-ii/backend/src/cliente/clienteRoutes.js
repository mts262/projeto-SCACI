import express from "express";
import { 
  cadastrarCliente, 
  editarCliente, 
  excluirCliente,
  // listarClientes // Descomente caso tenha criado a função de listagem/busca
} from "./clienteController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();
const uploadCampos = upload.fields([
  { name: 'url_comprovante_residencia', maxCount: 1 },
  { name: 'url_comprovante_uniao', maxCount: 1 }
]);
// Cadastrar cliente
router.post("/cliente", uploadCampos ,cadastrarCliente);

// Excluir cliente por ID
router.delete("/cliente/:id_cliente", excluirCliente);

// Editar cliente por ID
router.put("/cliente/:id_cliente",uploadCampos , editarCliente);

// (Opcional) Listar / Buscar clientes
// router.get("/clientes", listarClientes);

export default router;