import express from "express";
import {
  cadastrarComprador,
  //editarComprador,
  excluirComprador,
  //pesquisarComprador,
  //buscarCompradorPorID
} from "./compradorController.js";
import { uploadComprovanteRenda } from "../middlewares/upload.js";

const router = express.Router();

// Cadastrar comprador
router.post("/comprador", (req, res, next) => {
  uploadComprovanteRenda(req, res, (erro) => {
    if (!erro) {
      return next();
    }

    if (erro.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ erro: "O comprovante de renda deve ter no máximo 5 MB." });
    }

    if (erro.code === "TIPO_ARQUIVO_INVALIDO" || erro.code?.startsWith("LIMIT_")) {
      return res.status(400).json({ erro: erro.message });
    }

    console.error("Erro ao receber comprovante de renda:", erro);
    return res.status(500).json({ erro: "Não foi possível receber o comprovante de renda." });
  });
}, cadastrarComprador);

// Listar / Pesquisar todos os compradores
//router.get("/compradores", pesquisarComprador);

// Buscar um comprador por ID
//router.get("/comprador/:id_comprador", buscarCompradorPorID);

// Editar comprador por ID
//router.put("/comprador/:id_comprador", editarComprador);

// Excluir comprador por ID
router.delete("/comprador/:id_comprador", excluirComprador);

export default router;
