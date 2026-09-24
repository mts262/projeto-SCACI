import express from "express";
import multer from 'multer';
import {
  cadastrarCliente,
  editarCliente,
  excluirCliente,
  pesquisarCliente // Descomente caso tenha criado a função de listagem/busca
} from "./clienteController.js";
import { upload } from "../middlewares/upload.js";


const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "comprovante_residencia") {
            cb(null, "uploads/comprovantes-residencia/");
        } else if (file.fieldname === "comprovante_uniao") {
            cb(null, "uploads/comprovantes-uniao/");
        }
    }
});

const upload = multer({ storage });


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
router.put("/cliente/:id_cliente",uploadCampos , editarCliente);


// (Opcional) Listar / Buscar clientes
router.get("/clientes", pesquisarCliente);


export default router;
