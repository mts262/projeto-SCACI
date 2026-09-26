import express from "express";
import {
  cadastrarCorretor,
  // editarCorretor,
  // excluirCorretor,
  // pesquisarCorretor,
  // buscarCorretorPorId
} from "./corretorController.js";

const router = express.Router();

// Cadastrar corretor
router.post("/corretor", cadastrarCorretor);

/*
// Listar / Pesquisar todos os corretores
router.get("/corretores", pesquisarCorretor);

// Buscar um corretor por ID
router.get("/corretor/:id_corretor", buscarCorretorPorId);

// Editar corretor por ID
router.put("/corretor/:id_corretor", editarCorretor);

// Excluir corretor por ID
router.delete("/corretor/:id_corretor", excluirCorretor);
*/

export default router;