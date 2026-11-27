import express from "express";
import prisma from "./database.js";
import clienteRoutes from "./cliente/clienteRoutes.js";
import corretorRoutes from "./corretor/corretorRoutes.js";
import funcionarioRoutes from "./funcionario/funcionarioRoutes.js"
import compradorRoutes from "./comprador/compradorRoutes.js";
import imovelRoutes from "./imovel/imovelRoutes.js";
import cors from "cors";

const app = express();
app.use(cors());
// configuração do multer para resolver os problemas relacionados a ponteiros de imagem no banco
app.use(express.json())
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.json());
app.use(clienteRoutes);
app.use("/uploads", express.static("uploads"));
app.use(corretorRoutes);
app.use(funcionarioRoutes);
app.use(compradorRoutes);
app.use(imovelRoutes);

app.listen(3000, async () => {
    console.log("Servidor rodando na porta 3000");

    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Banco de dados conectado!");
    } catch (error) {
        console.error("Erro ao acessar o banco:", error);
    }
});
