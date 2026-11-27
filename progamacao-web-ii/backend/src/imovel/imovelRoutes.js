import express from "express";
import {
  editarImovel,
  pesquisarImovel,
  buscarImovelPorID
} from "./imovelController.js";
import { uploadArquivosImovel } from "../middlewares/upload.js";

const router = express.Router();

// Recebe o comprovante de posse e a certidão de matrícula (multipart) e traduz os erros do multer
function receberArquivosImovel(req, res, next) {
  uploadArquivosImovel(req, res, (erro) => {
    if (!erro) {
      return next();
    }

    if (erro.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ erro: "Cada arquivo do imóvel deve ter no máximo 5 MB." });
    }

    if (erro.code === "TIPO_ARQUIVO_INVALIDO" || erro.code?.startsWith("LIMIT_")) {
      return res.status(400).json({ erro: erro.message });
    }

    console.error("Erro ao receber arquivos do imóvel:", erro);
    return res.status(500).json({ erro: "Não foi possível receber os arquivos do imóvel." });
  });
}

// Listar / Pesquisar todos os imóveis
router.get("/imoveis", pesquisarImovel);

// Buscar um imóvel por ID
router.get("/imovel/:id_imovel", buscarImovelPorID);

// Editar imóvel por ID
router.put("/imovel/:id_imovel", receberArquivosImovel, editarImovel);

export default router;
