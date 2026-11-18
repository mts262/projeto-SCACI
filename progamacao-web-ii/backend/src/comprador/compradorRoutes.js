import express from "express";
import {
  cadastrarComprador,
  editarComprador,
  excluirComprador,
  pesquisarComprador,
  buscarCompradorPorID
} from "./compradorController.js";

const router = express.Router();

// Cadastrar comprador
//router.post("/comprador", cadastrarComprador);

// Listar / Pesquisar todos os compradores
//router.get("/compradores", pesquisarComprador);

// Buscar um comprador por ID
//router.get("/comprador/:id_comprador", buscarCompradorPorID);

// Editar comprador por ID
//router.put("/comprador/:id_comprador", editarComprador);

// Excluir comprador por ID
router.delete("/comprador/:id_comprador", excluirComprador);

export default router;